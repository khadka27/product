/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import bgImageSrc from "@/Image/bg.png";
import bgDarkImageSrc from "@/Image/bg-dark.png";

// Define TypeScript interface for our product data
interface ProductData {
  id: string;
  old_name: string;
  new_name: string;
  description: string;
  description_points: string[];
  rename_reason: string;
  old_images: string[];
  new_images: string[];
  badge_image_url: string | null;
  extra_badge_1: string | null;
  extra_badge_2: string | null;
  next_redirect_url: string;
  redirect_timer: number;
  theme: string;
  generated_link: string;
  page_title: string;

  total_clicks: number;
}

export default function ProductRebrandContent() {
  // State variables
  const [timeLeft, setTimeLeft] = useState(10);
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Router and params
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  // Fetch product data
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Extract product ID from slug
        const idMatch = slug.match(
          /-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
        );
        const productId = idMatch ? idMatch[1] : slug;

        // Log the extraction for debugging
        console.log(`Extracting product ID from slug: ${slug} -> ${productId}`);

        // Make API request
        const response = await axios.get(`/api/product/${productId}`);

        // Check response status
        if (response.status !== 200) {
          throw new Error(`API returned status code ${response.status}`);
        }

        const productData = response.data;
        console.log(`Fetched product data:`, productData);

        if (!productData) {
          throw new Error("Product not found or empty response");
        }

        // Process the product data - handle potential JSON strings
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

        console.log("Successfully fetched product data:", processedProduct.id);

        // Track page view by making a request to the visit tracking endpoint
        try {
          await axios.post(`/api/analytics/visit`, {
            productId: processedProduct.id,
          });
        } catch (visitError) {
          console.warn("Failed to track visit:", visitError);
        }

        setProduct(processedProduct);
        setTimeLeft(processedProduct.redirect_timer || 10);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);

        // Set specific error message
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setError("Product not found");
          } else {
            setError(`API error: ${error.message}`);
          }
        } else {
          setError(
            `Unexpected error: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }

        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0 || !product?.next_redirect_url) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Redirect when timer reaches zero
          if (product.next_redirect_url) {
            handleBuyNow();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, product]);

  // Animation visibility effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Scroll to second section function
  const scrollToSecondSection = () => {
    secondSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle buy now button click
  const handleBuyNow = () => {
    if (product?.next_redirect_url) {
      if (product.next_redirect_url.startsWith("#")) {
        // If it's a hash link, scroll to that section
        const element = document.querySelector(product.next_redirect_url);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Otherwise navigate to the URL
        router.push(product.next_redirect_url);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#e2f5fb] dark:bg-[#17414f] flex justify-center items-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#17414f]/30 dark:border-[#41bae3]/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#17414f] dark:border-t-[#41bae3] rounded-full animate-spin"></div>
          </div>
          <p className="text-[#17414f] dark:text-white animate-pulse text-xl font-medium">
            Loading product information...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#e2f5fb] dark:bg-[#17414f] flex justify-center items-center">
        <div className="bg-white dark:bg-[#1a2e35] p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-[#17414f] dark:text-white mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error ||
              "The requested product could not be found. Please check the URL and try again."}
          </p>
          <Button
            className="bg-[#17414f] hover:bg-[#0f2a33] dark:bg-[#41bae3] dark:hover:bg-[#3da4c7] text-white"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </div>
      </main>
    );
  }

  // Get image sources with fallbacks
  const oldImageSrc =
    product.old_images && product.old_images.length > 0
      ? product.old_images[0]
      : "/placeholder.svg?text=Old+Product";

  const newImageSrc =
    product.new_images && product.new_images.length > 0
      ? product.new_images[0]
      : "/placeholder.svg?text=New+Product";

  // Get badge image sources with fallbacks
  const badgeImageSrc =
    product.badge_image_url || "/placeholder.svg?text=Guarantee";
  const extraBadge1Src =
    product.extra_badge_1 || "/placeholder.svg?text=Badge+1";
  const extraBadge2Src =
    product.extra_badge_2 || "/placeholder.svg?text=Badge+2";

  return (
    <main
      className={`min-h-screen overflow-hidden text-center relative ${
        product.theme === "dark"
          ? "bg-[#17414f] text-white"
          : "bg-[#e2f5fb] text-[#17414f]"
      }`}
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">{/* <ThemeToggle /> */}</div>

      {/* First Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 py-12 md:py-4 lg:py-8">
        {/* Timer */}
        {timeLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 px-6 py-2 bg-[#c9351b] text-white font-bold rounded-full shadow-lg"
          >
            <span>Hurry Slots Available only {timeLeft} sec</span>
          </motion.div>
        )}

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center mb-8 max-w-4xl"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="text-[#41bae3] dark:text-[#41bae3]">
              {product.old_name}
            </span>{" "}
            <span className="text-[#ffffff] dark:text-white">
              HAS BEEN RENAMED TO
            </span>{" "}
            <span className="text-[#482af4] dark:text-white">
              {product.new_name}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-[#ffffff] dark:text-white font-medium">
            DUE TO COUNTERFEIT ISSUES
          </p>
        </motion.div>

        {/* Product Comparison - Improved for mobile and large screens */}
        <div className="flex flex-row items-center justify-between gap-4 xs:gap-6 sm:gap-8 md:gap-16 lg:gap-24 w-full max-w-7xl mx-auto mb-8 relative xs:relative">
          {/* Old Product */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center z-10 w-1/3 xs:w-2/5"
          >
            <div className="relative w-full max-w-[250px]">
              <Image
                src={oldImageSrc || "/placeholder.svg"}
                alt={`${product.old_name} bottle`}
                width={200}
                height={250}
                style={{ objectFit: "contain" }}
                className="p-2 ml-5"
              />
            </div>
            <span className="text-[#ffffff] dark:text-[#41bae3] font-bold text-lg xs:text-lg sm:text-2xl md:text-3xl text-center mt-2 xs:mt-4">
              {product.old_name}
            </span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center items-center z-10 absolute left-1/2 transform -translate-x-1/2 xs:static xs:transform-none"
          >
            <motion.div
              className="relative bg-[#3da4c7] text-white p-1 xs:p-2 sm:p-3 rounded-md shadow-lg"
              animate={{
                x: [0, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* New Product */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col items-center z-10 w-1/3 xs:w-2/5"
          >
            <motion.div
              className="relative w-full max-w-[250px] "
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              <Image
                src={newImageSrc || "/placeholder.svg"}
                alt={`${product.new_name} bottle`}
                width={200}
                height={250}
                style={{ objectFit: "contain" }}
                className="p-2 ml-5  drop-shadow-lg "
              />
              <div className="absolute -top-2 -right-2 xs:-top-4 xs:-right-4 w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 animate-pulse">
                <Image
                  src={badgeImageSrc || "/placeholder.svg"}
                  alt="Money Back Guarantee"
                  width={100}
                  height={100}
                  className="drop-shadow-lg"
                />
              </div>
            </motion.div>
            <span className="text-[#c9351b] font-bold text-lg xs:text-lg sm:text-2xl md:text-3xl text-center mt-2 xs:mt-4">
              {product.new_name}
            </span>
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-row gap-4 justify-center  w-full max-w-md mx-auto px-4"
        >
          <Button
            onClick={scrollToSecondSection}
            variant="outline"
            className="bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-[#1a2e35] text-[#17414f] dark:text-white border-[#17414f] dark:border-white rounded-full px-4 xs:px-6 py-4 xs:py-6 text-xs xs:text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 w-1/2"
          >
            LEARN MORE
          </Button>

          <Button
            onClick={handleBuyNow}
            className="bg-[#000000] hover:bg-[#0f2a33] dark:bg-[#41bae3] dark:hover:bg-[#3da4c7] text-white rounded-full px-4 xs:px-6 py-4 xs:py-6 text-xs xs:text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 w-1/2"
          >
            <ShoppingCart className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />{" "}
            BUY NOW
          </Button>
        </motion.div>
      </section>

      {/* Second Section */}
      <section
        ref={secondSectionRef}
        id="buy-now"
        className={`relative z-10 py-16 md:py-24 ${
          product.theme === "dark"
            ? "bg-[#1a2e35] text-white"
            : "bg-white text-[#17414f]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-24">
            {/* Product Image */}
            <div className="md:w-1/2 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Image
                  src={
                    product.theme === "dark"
                      ? bgDarkImageSrc
                      : bgImageSrc || "/placeholder.svg"
                  }
                  alt={`${product.old_name} bottle`}
                  width={450}
                  height={500}
                  style={{ objectFit: "contain" }}
                  className="absolute drop-shadow-xl w-[250px] h-[300px] sm:w-[500px] sm:h-[500px] object-cover rounded-lg md:ml-56 opacity-50"
                />

                <motion.div
                  className="relative w-64 h-80 sm:w-3xl sm:h-96 md:ml-50"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src={newImageSrc || "/placeholder.svg"}
                    alt={`${product.new_name} bottle`}
                    width={250}
                    height={300}
                    style={{ objectFit: "contain" }}
                    className="drop-shadow-xl w-[200px] h-[300px] sm:w-[400px] sm:h-[500px] object-cover rounded-lg "
                  />
                </motion.div>
                <div className="absolute -top-4 ml-32 md:ml-[450px] w-24 h-24 animate-pulse">
                  <Image
                    src={badgeImageSrc || "/placeholder.svg"}
                    alt="Money Back Guarantee"
                    width={150}
                    height={150}
                    priority
                    className="drop-shadow-lg"
                  />
                </div>
              </motion.div>
            </div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:w-1/2 text-left"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#17414f] dark:text-white mb-6">
                {product.new_name}{" "}
              </h2>

              <p className="text-[#17414f] dark:text-gray-200 mb-6 text-lg">
                {product.description}
              </p>

              <ul className="space-y-4 mb-8">
                {product.description_points.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-start text-lg ${
                      product.theme === "dark"
                        ? "text-gray-200"
                        : "text-[#17414f]"
                    }`}
                  >
                    <div
                      className={`mr-3 mt-1 ${
                        product.theme === "dark"
                          ? "text-[#41bae3]"
                          : "text-[#17414f]"
                      }`}
                    >
                      •
                    </div>
                    {point}
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-row items-center gap-6">
                <Button
                  onClick={handleBuyNow}
                  className="bg-[#000000] hover:bg-[#0f2a33] dark:bg-[#41bae3] dark:hover:bg-[#3da4c7] text-white rounded-full px-8 py-7 text-lg font-bold w-1/2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> BUY NOW
                </Button>

                <div className="flex gap-6">
                  {product.extra_badge_1 && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <Image
                        src={extraBadge1Src || "/placeholder.svg"}
                        alt="Certification Badge 1"
                        width={60}
                        height={60}
                        className="drop-shadow-md"
                      />
                    </motion.div>
                  )}
                  {product.extra_badge_2 && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <Image
                        src={extraBadge2Src || "/placeholder.svg"}
                        alt="Certification Badge 2"
                        width={60}
                        height={60}
                        className="drop-shadow-md"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`relative z-10 py-6 ${
          product.theme === "dark" ? "bg-[#0f2a33]" : "bg-[#17414f]"
        } text-white text-center`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-sm">
            © {new Date().getFullYear()} {product.new_name}. All Rights
            Reserved.
          </p>
          {product.total_clicks > 0 && (
            <p className="text-xs mt-1 text-white/70">
              {product.total_clicks}+ views
            </p>
          )}
        </div>
      </footer>
    </main>
  );
}
