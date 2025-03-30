/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Clock, CheckCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

// First, let's add the Oswald font import at the top of the file
import { Oswald } from "next/font/google";

// Add the font configuration
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Enhanced product type to match our updated database
type Product = {
  id: string;
  old_name: string;
  new_name: string;
  description: string;
  description_points: string[];
  rename_reason: string;
  old_images: string[];
  new_images: string[];
  badge_image_url: string | null;
  next_redirect_url: string;
  redirect_timer: number;
  theme: "light" | "dark";
  generated_link: string;
  page_title: string;
  popup_title: string;
  popup_content: string;
};

// Update the product comparison component to include user interaction tracking for the timer
export default function ProductComparisonPage() {
  // Add these new state variables for tracking user interaction
  const [userInteracting, setUserInteracting] = useState(false);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pausedTimeRef = useRef<number | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isSmallMobile = useMediaQuery("(max-width: 380px)");

  // Extract product ID from slug
  const getProductIdFromSlug = (slug: string) => {
    // The slug format is "name-uuid" where uuid is a UUID with dashes
    // Example: maxman-b02c0edd-909f-4ba9-a114-7931aaf29ac9
    const uuidRegex =
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const match = slug.match(uuidRegex);
    if (match) {
      return match[1]; // Return the full UUID if found
    }
    // If no UUID found, try another approach - get the last part
    const parts = slug.split("-");
    return parts[parts.length - 1];
  };

  // Function to create a mock product when API fails (for demo/development)
  const createMockProduct = () => {
    console.log("Creating mock product for demonstration");
    return {
      id: "mock-id",
      old_name: "MaxMan",
      new_name: "Goliath XL10",
      description:
        "We've upgraded our formula with premium ingredients for better results and improved overall performance.",
      description_points: [
        "Enhanced formula with improved ingredients for better results",
        "New branding that better reflects our product's premium quality",
        "Same trusted manufacturing process with quality controls",
        "Improved packaging for better product preservation",
      ],
      rename_reason:
        "After extensive market research and customer feedback, we've decided to rename our product to better reflect its premium quality and effectiveness.",
      old_images: ["/placeholder-old.jpg"],
      new_images: ["/placeholder-new.jpg"],
      badge_image_url: null,
      next_redirect_url: "/",
      redirect_timer: 0,
      theme: "light" as "light" | "dark",
      generated_link: "",
      page_title: "MaxMan has been renamed to Goliath XL10",
      popup_title: "Why We've Renamed MaxMan",
      popup_content:
        "After extensive market research and customer feedback, we've decided to rename our product to better reflect its premium quality and effectiveness.\n\nThe new name 'Goliath XL10' better communicates the product's strength and performance benefits.",
    };
  };

  // Fetch product data
  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    setShowNewProduct(false);

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Get the product
    const productId = getProductIdFromSlug(slug);
    console.log("Extracted product ID:", productId);

    // Try to fetch the product
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/product/${productId}`);
        const productData = response.data;

        if (!productData) {
          throw new Error("Product not found");
        }

        // Process the product data
        const processedProduct = {
          ...productData,
          old_images: Array.isArray(productData.old_images)
            ? productData.old_images
            : JSON.parse(productData.old_images || "[]"),
          new_images: Array.isArray(productData.new_images)
            ? productData.new_images
            : JSON.parse(productData.new_images || "[]"),
          description_points: Array.isArray(productData.description_points)
            ? productData.description_points
            : JSON.parse(productData.description_points || "[]"),
        };

        setProduct(processedProduct);

        // Set theme based on the product's theme
        if (
          processedProduct.theme === "dark" ||
          processedProduct.theme === "light"
        ) {
          setTheme(processedProduct.theme);
          // Apply theme class to document
          if (processedProduct.theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        // Set the timer value from the database, default to 10 if not set
        setTimeLeft(processedProduct.redirect_timer || 10);

        setIsLoading(false);

        // Show the new product with a slight delay after data loads
        setTimeout(() => {
          setShowNewProduct(true);
        }, 500);
      } catch (error) {
        console.error("API error:", error);

        // For development/demo purposes - create a mock product
        const mockProduct = createMockProduct();

        // Process the mock product data
        setProduct(mockProduct);
        setTheme(mockProduct.theme as "light" | "dark");
        setTimeLeft(mockProduct.redirect_timer || 10);

        setIsLoading(false);

        setTimeout(() => {
          setShowNewProduct(true);
        }, 500);
      }
    };

    fetchProduct();
  }, [slug]);

  // Update the timer useEffect to handle pausing/resuming
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!product || product.redirect_timer <= 0) return;

    // Only start the timer if user is not interacting
    if (!userInteracting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (product.next_redirect_url) {
              handleProceed();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [product, userInteracting]);

  // Add user interaction handlers
  const handleUserInteraction = () => {
    // Clear any existing interaction timer
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }

    // If not already interacting, pause the timer
    if (!userInteracting) {
      setUserInteracting(true);
      pausedTimeRef.current = timeLeft;

      // Clear the redirect timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Set a timeout to resume the timer after 2 seconds of inactivity
    interactionTimerRef.current = setTimeout(() => {
      setUserInteracting(false);
    }, 2000);
  };

  // Add event listeners for user interaction
  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    const handleEvent = () => {
      handleUserInteraction();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleEvent);
      });

      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, []);

  const handleGoBack = () => router.back();

  const handleProceed = () => {
    if (product?.next_redirect_url) {
      router.push(product.next_redirect_url);
    } else {
      router.push("/");
    }
  };

  const handleLearnMore = () => {
    setShowPopup(true);
  };

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ backgroundColor: theme === "dark" ? "#2C2C2C" : "white" }}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600/30 dark:border-yellow-400/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-red-600 dark:border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-black/80 dark:text-white/80 animate-pulse text-xl font-medium">
            Loading product information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ backgroundColor: theme === "dark" ? "#2C2C2C" : "white" }}
      >
        <Card
          className={`max-w-md w-full p-6 shadow-2xl border-red-500/20 ${
            theme === "dark" ? "dark bg-[#002147]/80" : "bg-white"
          }`}
        >
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="rounded-full bg-red-600/10 dark:bg-yellow-400/10 p-4">
              <CheckCircle className="h-10 w-10 text-red-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Product Not Found
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300">
              {error ?? "The requested product could not be found."}
            </p>
            <Button
              onClick={handleGoBack}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white dark:text-black"
            >
              Return to Previous Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the old and new image sources
  const oldImageSrc =
    product.old_images && product.old_images.length > 0
      ? product.old_images[0]
      : "/placeholder.svg?height=280&width=280";

  const newImageSrc =
    product.new_images && product.new_images.length > 0
      ? product.new_images[0]
      : "/placeholder.svg?height=280&width=280";

  // Increase the image size
  const imageSize = 300;

  // Page title (use custom or fallback)
  const pageTitle =
    product.page_title ||
    `${product.old_name} has been renamed to ${product.new_name}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col min-h-screen text-black dark:text-white ${oswald.className}`}
      style={{ backgroundColor: theme === "dark" ? "#2C2C2C" : "white" }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-red-700 to-red-500 dark:from-red-800 dark:to-red-600 text-white p-3 flex justify-center items-center shadow-lg"
      >
        <h1 className="text-center text-lg md:text-2xl font-bold px-2 py-1">
          {pageTitle}
        </h1>
      </motion.div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col justify-start items-center px-4  max-w-6xl mx-auto w-full">
        {/* Products Comparison Section */}
        <div
          className={cn(
            "flex flex-row justify-center items-center w-full mb-4 gap-6"
          )}
        >
          {/* Old Product Column */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <motion.div
                className="relative overflow-hidden rounded-md bg-transparent p-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={oldImageSrc || "/placeholder.svg"}
                  alt={product.old_name}
                  width={imageSize}
                  height={imageSize}
                  className="object-contain"
                />
              </motion.div>
            </div>
            <motion.h3
              className="mt-1 font-bold text-base md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {product.old_name}
            </motion.h3>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center justify-center">
            <div className={`arrow ${theme === "dark" ? "dark" : "light"}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* New Product Column */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <AnimatePresence>
                {showNewProduct && (
                  <motion.div
                    className="relative overflow-hidden rounded-md bg-transparent p-2"
                    initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotateY: 0,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                  >
                    <Image
                      src={newImageSrc || "/placeholder.svg"}
                      alt={product.new_name}
                      width={imageSize}
                      height={imageSize}
                      className="object-contain"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Badge - positioned outside but overlapping */}
              {showNewProduct && (
                <>
                  {product.badge_image_url && (
                    <motion.div
                      className="absolute -top-0 -right-0 z-10 mr-5 mt-5 badge-mobile"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1, duration: 0.5, type: "spring" }}
                    >
                      <Image
                        src={product.badge_image_url || "/placeholder.svg"}
                        alt="Badge"
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </motion.div>
                  )}

                  {/* If no custom badge, show default badge */}
                  {!product.badge_image_url && (
                    <motion.div
                      className="absolute -top-10 -right-10 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center badge-mobile"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1, duration: 0.5, type: "spring" }}
                    >
                      <div className="text-white text-sm font-bold text-center leading-tight">
                        ALL
                        <br />
                        NATURAL
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
            <motion.h3
              className="mt-1 font-bold text-base md:text-xl text-red-600 dark:text-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {product.new_name}
            </motion.h3>
          </div>
        </div>

        {/* Description & Bullet Points */}
        <motion.div
          className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800/80 rounded-lg p-6 shadow-lg mb-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* <h2 className="text-2xl font-bold text-center mb-4 text-red-600 dark:text-red-400 uppercase">
            Product Improvements
          </h2> */}

          <p className="description-text text-center text-gray-700 dark:text-gray-200 mb-5">
            {product.description}
          </p>

          {/* Bullet Points */}
          <div className="space-y-3 mt-5">
            {product.description_points &&
              product.description_points
                .filter((p) => p && p.trim())
                .map((point, index) => (
                  <div className="flex items-start" key={index}>
                    <Check
                      className="text-green-500 mt-0.5 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <p className="text-gray-700 dark:text-gray-200 text-base font-arial">
                      {point}
                    </p>
                  </div>
                ))}
          </div>
        </motion.div>

        {/* Buttons */}
        {/* <div className="flex flex-row gap-4 justify-center items-center w-full max-w-xl mx-auto">
          <Button
            onClick={handleProceed}
            className="action-button bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 px-8 rounded-md text-base font-bold uppercase shadow-md"
          >
            PROCEED
          </Button>

          <Button
            onClick={handleLearnMore}
            className="action-button bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-red-600 dark:text-gray-200 py-3 px-8 rounded-md text-base font-bold uppercase shadow-md border border-gray-200 dark:border-gray-700"
          >
            LEARN MORE
          </Button>
        </div> */}

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center w-full max-w-xl mx-auto px-4 md:px-0">
          <Button
            onClick={handleProceed}
            className="action-button bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-6 px-10 rounded-lg text-lg font-bold uppercase shadow-lg animate-sine"
          >
            PROCEED
          </Button>

          <Button
            onClick={handleLearnMore}
            className="action-button bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-red-600 dark:text-gray-200 py-6 px-10 rounded-lg text-lg font-bold uppercase shadow-lg border border-gray-200 dark:border-gray-700"
          >
            LEARN MORE
          </Button>

          {/* Timer indicator - show interaction status */}
          {product.redirect_timer > 0 && (
            <div className=" flex justify-center   ">
              <div className="flex  items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/80 rounded-full shadow-md">
                <Clock
                  className={`h-4 w-4 ${
                    userInteracting
                      ? "text-yellow-500"
                      : "text-red-600 dark:text-yellow-400 animate-pulse"
                  }`}
                />
                <span className="text-sm font-medium">
                  {userInteracting ? (
                    <span className="text-yellow-500  font-bold">
                      Timer paused
                    </span>
                  ) : (
                    <>
                      Redirecting in{" "}
                      <span className="text-red-600 dark:text-yellow-400 font-bold">
                        {timeLeft}s
                      </span>
                    </>
                  )}
                </span>
                <Progress
                  value={
                    (product.redirect_timer - timeLeft) *
                    (100 / product.redirect_timer)
                  }
                  className="w-16 h-1.5"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Learn More Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-700 to-red-500 dark:from-red-800 dark:to-red-600 text-white p-5 rounded-t-lg">
                <h2 className="text-2xl font-bold text-center uppercase">
                  {product.popup_title ||
                    `Why we've renamed ${product.old_name} to ${product.new_name}`}
                </h2>
              </div>

              <div className="p-8 popup-content">
                {product.popup_content ? (
                  <div className="prose dark:prose-invert max-w-none prose-lg">
                    {product.popup_content.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="mb-4 text-center">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none prose-lg">
                    <p className="text-center">
                      {product.rename_reason ||
                        `After extensive research and customer feedback, we've decided to rename ${product.old_name} to ${product.new_name}.`}
                    </p>
                    <p className="text-center">
                      This change reflects our commitment to quality and our
                      evolution as a brand. The new name better represents the
                      product&apos;s benefits and aligns with our vision for the
                      future.
                    </p>
                    <p className="text-center">
                      Rest assured that while the name has changed, the quality
                      you&apos;ve come to expect remains the same - with some
                      improvements to make your experience even better.
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => setShowPopup(false)}
                  className="action-button w-full mt-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 dark:from-red-600 dark:to-red-500 dark:hover:from-red-700 dark:hover:to-red-600 text-white py-3 rounded-md font-bold text-lg shadow-md"
                >
                  CLOSE
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
