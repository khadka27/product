/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Image from "next/image";
// import { Clock, CheckCircle, Check, CircleCheckBig } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useMediaQuery } from "@/hooks/use-media-query";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Card, CardContent } from "@/components/ui/card";
// import axios from "axios";

// // First, let's add the Oswald font import at the top of the file
// import { Oswald } from "next/font/google";

// // Add the font configuration
// const oswald = Oswald({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
// });

// // Enhanced product type to match our updated database
// type Product = {
//   id: string;
//   old_name: string;
//   new_name: string;
//   description: string;
//   description_points: string[];
//   rename_reason: string;
//   old_images: string[];
//   new_images: string[];
//   badge_image_url: string | null;
//   next_redirect_url: string;
//   redirect_timer: number;
//   theme: "light" | "dark";
//   generated_link: string;
//   page_title: string;
//   popup_title: string;
//   popup_content: string;
// };

// // Update the product comparison component to include user interaction tracking for the timer
// export default function ProductComparisonPage() {
//   // Add these new state variables for tracking user interaction
//   const [userInteracting, setUserInteracting] = useState(false);
//   const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const pausedTimeRef = useRef<number | null>(null);

//   const [product, setProduct] = useState<Product | null>(null);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showNewProduct, setShowNewProduct] = useState(false);
//   const [theme, setTheme] = useState<"light" | "dark">("dark");
//   const [error, setError] = useState<string | null>(null);
//   const [showPopup, setShowPopup] = useState(false);

//   const router = useRouter();
//   const params = useParams();
//   const slug = params?.slug as string;

//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const isMobile = useMediaQuery("(max-width: 768px)");
//   const isSmallMobile = useMediaQuery("(max-width: 380px)");

//   // Extract product ID from slug
//   const getProductIdFromSlug = (slug: string) => {
//     // The slug format is "name-uuid" where uuid is a UUID with dashes
//     // Example: maxman-b02c0edd-909f-4ba9-a114-7931aaf29ac9
//     const uuidRegex =
//       /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
//     const match = slug.match(uuidRegex);
//     if (match) {
//       return match[1]; // Return the full UUID if found
//     }
//     // If no UUID found, try another approach - get the last part
//     const parts = slug.split("-");
//     return parts[parts.length - 1];
//   };

//   // Function to create a mock product when API fails (for demo/development)
//   const createMockProduct = () => {
//     console.log("Creating mock product for demonstration");
//     return {
//       id: "mock-id",
//       old_name: "MaxMan",
//       new_name: "Goliath XL10",
//       description:
//         "We've upgraded our formula with premium ingredients for better results and improved overall performance.",
//       description_points: [
//         "Enhanced formula with improved ingredients for better results",
//         "New branding that better reflects our product's premium quality",
//         "Same trusted manufacturing process with quality controls",
//         "Improved packaging for better product preservation",
//       ],
//       rename_reason:
//         "After extensive market research and customer feedback, we've decided to rename our product to better reflect its premium quality and effectiveness.",
//       old_images: ["/placeholder-old.jpg"],
//       new_images: ["/placeholder-new.jpg"],
//       badge_image_url: null,
//       next_redirect_url: "/",
//       redirect_timer: 0,
//       theme: "light" as "light" | "dark",
//       generated_link: "",
//       page_title: "MaxMan has been renamed to Goliath XL10",
//       popup_title: "Why We've Renamed MaxMan",
//       popup_content:
//         "After extensive market research and customer feedback, we've decided to rename our product to better reflect its premium quality and effectiveness.\n\nThe new name 'Goliath XL10' better communicates the product's strength and performance benefits.",
//     };
//   };

//   // Fetch product data
//   useEffect(() => {
//     if (!slug) return;

//     setIsLoading(true);
//     setShowNewProduct(false);

//     // Clear existing timer
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//     }

//     // Get the product
//     const productId = getProductIdFromSlug(slug);
//     console.log("Extracted product ID:", productId);

//     // Try to fetch the product
//     const fetchProduct = async () => {
//       try {
//         const response = await axios.get(`/api/product/${productId}`);
//         const productData = response.data;

//         if (!productData) {
//           throw new Error("Product not found");
//         }

//         // Process the product data
//         const processedProduct = {
//           ...productData,
//           old_images: Array.isArray(productData.old_images)
//             ? productData.old_images
//             : JSON.parse(productData.old_images || "[]"),
//           new_images: Array.isArray(productData.new_images)
//             ? productData.new_images
//             : JSON.parse(productData.new_images || "[]"),
//           description_points: Array.isArray(productData.description_points)
//             ? productData.description_points
//             : JSON.parse(productData.description_points || "[]"),
//         };

//         setProduct(processedProduct);

//         // Set theme based on the product's theme
//         if (
//           processedProduct.theme === "dark" ||
//           processedProduct.theme === "light"
//         ) {
//           setTheme(processedProduct.theme);
//           // Apply theme class to document
//           if (processedProduct.theme === "dark") {
//             document.documentElement.classList.add("dark");
//           } else {
//             document.documentElement.classList.remove("dark");
//           }
//         }

//         // Set the timer value from the database, default to 10 if not set
//         setTimeLeft(processedProduct.redirect_timer || 10);

//         setIsLoading(false);

//         // Show the new product with a slight delay after data loads
//         setTimeout(() => {
//           setShowNewProduct(true);
//         }, 500);
//       } catch (error) {
//         console.error("API error:", error);

//         // For development/demo purposes - create a mock product
//         const mockProduct = createMockProduct();

//         // Process the mock product data
//         setProduct(mockProduct);
//         setTheme(mockProduct.theme as "light" | "dark");
//         setTimeLeft(mockProduct.redirect_timer || 10);

//         setIsLoading(false);

//         setTimeout(() => {
//           setShowNewProduct(true);
//         }, 500);
//       }
//     };

//     fetchProduct();
//   }, [slug]);

//   // Update the timer useEffect to handle pausing/resuming
//   useEffect(() => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (!product || product.redirect_timer <= 0) return;

//     // Only start the timer if user is not interacting
//     if (!userInteracting) {
//       timerRef.current = setInterval(() => {
//         setTimeLeft((prevTime) => {
//           if (prevTime <= 1) {
//             if (timerRef.current) clearInterval(timerRef.current);
//             if (product.next_redirect_url) {
//               handleProceed();
//             }
//             return 0;
//           }
//           return prevTime - 1;
//         });
//       }, 1000);
//     }

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [product, userInteracting]);

//   // Add user interaction handlers
//   const handleUserInteraction = () => {
//     // Clear any existing interaction timer
//     if (interactionTimerRef.current) {
//       clearTimeout(interactionTimerRef.current);
//     }

//     // If not already interacting, pause the timer
//     if (!userInteracting) {
//       setUserInteracting(true);
//       pausedTimeRef.current = timeLeft;

//       // Clear the redirect timer
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     }

//     // Set a timeout to resume the timer after 2 seconds of inactivity
//     interactionTimerRef.current = setTimeout(() => {
//       setUserInteracting(false);
//     }, 2000);
//   };

//   // Add event listeners for user interaction
//   useEffect(() => {
//     const events = [
//       "mousemove",
//       "mousedown",
//       "keydown",
//       "touchstart",
//       "scroll",
//     ];

//     const handleEvent = () => {
//       handleUserInteraction();
//     };

//     events.forEach((event) => {
//       window.addEventListener(event, handleEvent);
//     });

//     return () => {
//       events.forEach((event) => {
//         window.removeEventListener(event, handleEvent);
//       });

//       if (interactionTimerRef.current) {
//         clearTimeout(interactionTimerRef.current);
//       }
//     };
//   }, []);

//   const handleGoBack = () => router.back();

//   const handleProceed = () => {
//     if (product?.next_redirect_url) {
//       router.push(product.next_redirect_url);
//     } else {
//       router.push("/");
//     }
//   };

//   const handleLearnMore = () => {
//     setShowPopup(true);
//   };

//   if (isLoading) {
//     return (
//       <div
//         className="flex justify-center items-center min-h-screen"
//         style={{ backgroundColor: theme === "dark" ? "#2C2C2C" : "white" }}
//       >
//         <div className="flex flex-col items-center gap-6">
//           <div className="relative w-20 h-20">
//             <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600/30 dark:border-yellow-400/30 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-red-600 dark:border-t-yellow-400 rounded-full animate-spin"></div>
//           </div>
//           <p className="text-black/80 dark:text-white/80 animate-pulse text-xl font-medium">
//             Loading product information...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div
//         className="flex justify-center items-center min-h-screen"
//         style={{ backgroundColor: theme === "dark" ? "#2C2C2C" : "white" }}
//       >
//         <Card
//           className={`max-w-md w-full p-6 shadow-2xl border-red-500/20 ${
//             theme === "dark" ? "dark bg-[#002147]/80" : "bg-white"
//           }`}
//         >
//           <CardContent className="flex flex-col items-center gap-4 pt-6">
//             <div className="rounded-full bg-red-600/10 dark:bg-yellow-400/10 p-4">
//               <CheckCircle className="h-10 w-10 text-red-600 dark:text-yellow-400" />
//             </div>
//             <h2 className="text-2xl font-bold text-black dark:text-white">
//               Product Not Found
//             </h2>
//             <p className="text-center text-gray-600 dark:text-gray-300">
//               {error ?? "The requested product could not be found."}
//             </p>
//             <Button
//               onClick={handleGoBack}
//               className="mt-4 w-full bg-red-600 hover:bg-red-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white dark:text-black"
//             >
//               Return to Previous Page
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Get the old and new image sources
//   const oldImageSrc =
//     product.old_images && product.old_images.length > 0
//       ? product.old_images[0]
//       : "/placeholder.svg?height=280&width=280";

//   const newImageSrc =
//     product.new_images && product.new_images.length > 0
//       ? product.new_images[0]
//       : "/placeholder.svg?height=280&width=280";

//   // Increase the image size
//   const imageSize = 300;

//   // Page title (use custom or fallback)
//   const pageTitle =
//     product.page_title ||
//     `${product.old_name} has been renamed to ${product.new_name}`;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//       className={`flex flex-col min-h-screen text-black dark:text-white ${oswald.className}`}
//       style={{ backgroundColor: theme === "dark" ? "#2C2C2C" : "white" }}
//     >
//       {/* Header */}
//       <motion.div
//         initial={{ y: -20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="bg-gradient-to-r from-red-700 to-red-500 dark:from-red-800 dark:to-red-600 text-white  flex justify-center items-center shadow-lg"
//       >
//         <h1 className="text-center text-lg md:text-2xl font-bold px-2 py-1               ">
//           {pageTitle}
//         </h1>
//       </motion.div>

//       {/* Main Content Container */}
//       <div className="flex-1 flex flex-col justify-start items-center px-4  max-w-6xl mx-auto w-full">
//         {/* Products Comparison Section */}
//         <div
//           className={cn(
//             "flex flex-row justify-center items-center w-full mb-4 gap-6"
//           )}
//         >
//           {/* Old Product Column */}
//           <div className="flex flex-col items-center text-center">
//             <div className="relative">
//               <motion.div
//                 className="relative overflow-hidden rounded-md bg-transparent p-2"
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <Image
//                   src={oldImageSrc || "/placeholder.svg"}
//                   alt={product.old_name}
//                   width={imageSize}
//                   height={imageSize}
//                   className="object-contain"
//                 />
//               </motion.div>
//             </div>
//             <motion.h3
//               className="mt-1 font-bold text-base md:text-xl"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3, duration: 0.5 }}
//             >
//               {product.old_name}
//             </motion.h3>
//           </div>

//           {/* Arrow */}
//           <div className="flex flex-col items-center justify-center">
//             <div className={`arrow ${theme === "dark" ? "dark" : "light"}`}>
//               <span></span>
//               <span></span>
//               <span></span>
//             </div>
//           </div>

//           {/* New Product Column */}
//           <div className="flex flex-col items-center text-center">
//             <div className="relative">
//               <AnimatePresence>
//                 {showNewProduct && (
//                   <motion.div
//                     className="relative overflow-hidden rounded-md bg-transparent p-2"
//                     initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
//                     animate={{
//                       opacity: 1,
//                       scale: 1,
//                       rotateY: 0,
//                     }}
//                     transition={{
//                       duration: 0.8,
//                     }}
//                   >
//                     <Image
//                       src={newImageSrc || "/placeholder.svg"}
//                       alt={product.new_name}
//                       width={imageSize}
//                       height={imageSize}
//                       className="object-contain"
//                     />
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Badge - positioned outside but overlapping */}
//               {showNewProduct && (
//                 <>
//                   {product.badge_image_url && (
//                     <motion.div
//                       className="absolute -top-0 -right-0 z-10 mr-5 mt-5 badge-mobile"
//                       initial={{ scale: 0, rotate: -20 }}
//                       animate={{ scale: 1, rotate: 0 }}
//                       transition={{ delay: 1, duration: 0.5, type: "spring" }}
//                     >
//                       <Image
//                         src={product.badge_image_url || "/placeholder.svg"}
//                         alt="Badge"
//                         width={100}
//                         height={100}
//                         className="object-contain"
//                       />
//                     </motion.div>
//                   )}

//                   {/* If no custom badge, show default badge */}
//                   {!product.badge_image_url && (
//                     <motion.div
//                       className="absolute -top-10 -right-10 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center badge-mobile"
//                       initial={{ scale: 0, rotate: -20 }}
//                       animate={{ scale: 1, rotate: 0 }}
//                       transition={{ delay: 1, duration: 0.5, type: "spring" }}
//                     >
//                       <div className="text-white text-sm font-bold text-center leading-tight">
//                         ALL
//                         <br />
//                         NATURAL
//                       </div>
//                     </motion.div>
//                   )}
//                 </>
//               )}
//             </div>
//             <motion.h3
//               className="mt-1 font-bold text-base md:text-xl text-red-600 dark:text-red-500"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3, duration: 0.5 }}
//             >
//               {product.new_name}
//             </motion.h3>
//           </div>
//         </div>

//         {/* Description & Bullet Points */}
//         <motion.div
//           className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800/80 rounded-lg p-6 shadow-lg mb-6 border border-gray-200 dark:border-gray-700"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6, duration: 0.5 }}
//         >
//           {/* <h2 className="text-2xl font-bold text-center mb-4 text-red-600 dark:text-red-400 uppercase">
//             Product Improvements
//           </h2> */}

//           <p className="description-text text-left text-gray-700 dark:text-gray-200 mb-5">
//             {product.description}
//           </p>

//           {/* Bullet Points */}
//           <div className="space-y-3 mt-5">
//             {product.description_points &&
//               product.description_points
//                 .filter((p) => p && p.trim())
//                 .map((point, index) => (
//                   <div className="flex items-start" key={index}>
//                     <CircleCheckBig
//                       className="text-green-500 mt-0.5 mr-3 flex-shrink-0"
//                       size={18}
//                     />
//                     <p className="text-gray-700 dark:text-gray-200 text-[0.90rem] font-arial">
//                       {point}
//                     </p>
//                   </div>
//                 ))}
//           </div>
//         </motion.div>

//         {/* Buttons */}
//         {/* <div className="flex flex-row gap-4 justify-center items-center w-full max-w-xl mx-auto">
//           <Button
//             onClick={handleProceed}
//             className="action-button bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 px-8 rounded-md text-base font-bold uppercase shadow-md"
//           >
//             PROCEED
//           </Button>

//           <Button
//             onClick={handleLearnMore}
//             className="action-button bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-red-600 dark:text-gray-200 py-3 px-8 rounded-md text-base font-bold uppercase shadow-md border border-gray-200 dark:border-gray-700"
//           >
//             LEARN MORE
//           </Button>
//         </div> */}

//         <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center w-full max-w-xl mx-auto px-4 md:px-0">
//           <Button
//             onClick={handleProceed}
//             className="action-button bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-6 px-10 rounded-lg text-lg font-bold uppercase shadow-lg animate-sine"
//           >
//             PROCEED
//           </Button>

//           <Button
//             onClick={handleLearnMore}
//             className="action-button bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-red-600 dark:text-gray-200 py-6 px-10 rounded-lg text-lg font-bold uppercase shadow-lg border border-gray-200 dark:border-gray-700"
//           >
//             LEARN MORE
//           </Button>

//           {/* Timer indicator - show interaction status */}
//           {product.redirect_timer > 0 && (
//             <div className=" flex justify-center   ">
//               <div className="flex  items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/80 rounded-full shadow-md">
//                 <Clock
//                   className={`h-4 w-4 ${
//                     userInteracting
//                       ? "text-yellow-500"
//                       : "text-red-600 dark:text-yellow-400 animate-pulse"
//                   }`}
//                 />
//                 <span className="text-sm font-medium">
//                   {userInteracting ? (
//                     <span className="text-yellow-500  font-bold">
//                       Timer paused
//                     </span>
//                   ) : (
//                     <>
//                       Redirecting in{" "}
//                       <span className="text-red-600 dark:text-yellow-400 font-bold">
//                         {timeLeft}s
//                       </span>
//                     </>
//                   )}
//                 </span>
//                 <Progress
//                   value={
//                     (product.redirect_timer - timeLeft) *
//                     (100 / product.redirect_timer)
//                   }
//                   className="w-16 h-1.5"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Learn More Popup */}
//       <AnimatePresence>
//         {showPopup && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
//             onClick={() => setShowPopup(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="bg-gradient-to-r from-red-700 to-red-500 dark:from-red-800 dark:to-red-600 text-white p-5 rounded-t-lg">
//                 <h4 className="text-2xl font-bold text-center uppercase">
//                   {product.popup_title ||
//                     `Why we've renamed ${product.old_name} to ${product.new_name}`}
//                 </h4>
//               </div>

//               <div className="p-8 popup-content">
//                 {product.popup_content ? (
//                   <div className="prose dark:prose-invert max-w-none prose-lg">
//                     {product.popup_content.split("\n\n").map((paragraph, i) => (
//                       <p key={i} className="mb-4 text-center">
//                         {paragraph}
//                       </p>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="prose dark:prose-invert max-w-none prose-lg">
//                     <p className="text-center">
//                       {product.rename_reason ||
//                         `After extensive research and customer feedback, we've decided to rename ${product.old_name} to ${product.new_name}.`}
//                     </p>
//                     <p className="text-center">
//                       This change reflects our commitment to quality and our
//                       evolution as a brand. The new name better represents the
//                       product&apos;s benefits and aligns with our vision for the
//                       future.
//                     </p>
//                     <p className="text-center">
//                       Rest assured that while the name has changed, the quality
//                       you&apos;ve come to expect remains the same - with some
//                       improvements to make your experience even better.
//                     </p>
//                   </div>
//                 )}

//                 <Button
//                   onClick={() => setShowPopup(false)}
//                   className="action-button w-full mt-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 dark:from-red-600 dark:to-red-500 dark:hover:from-red-700 dark:hover:to-red-600 text-white py-3 rounded-md font-bold text-lg shadow-md"
//                 >
//                   CLOSE
//                 </Button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }

// File: /app/product/[slug]/page.tsx
// import ProductRebrand from "@/components/ProductComparisonPage";

// export default function ProductPage({ params }: { params: { slug: string } }) {
//   return <ProductRebrand />;
// }

// // This enables SSR for this page
// export const dynamic = "force-dynamic";

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
// import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import bgImageSrc from "@/Image/bg.png";

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
  popup_title: string;
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
    <main className="min-h-screen bg-[#e2f5fb] dark:bg-[#17414f] overflow-hidden text-center relative">
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
            <span className="text-[#17414f] dark:text-white">
              HAS BEEN RENAMED TO
            </span>{" "}
            <span className="text-[#17414f] dark:text-white">
              {product.new_name}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-[#17414f] dark:text-white font-medium">
            DUE TO COUNTERFEIT ISSUES
          </p>
        </motion.div>

        {/* Product Comparison - Improved for mobile */}
        <div className="flex flex-row items-center justify-center gap-4 xs:gap-6 sm:gap-8 md:gap-16 w-full max-w-5xl mb-8">
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
            <span className="text-[#17414f] dark:text-[#41bae3] font-bold text-lg xs:text-lg sm:text-2xl md:text-3xl text-center mt-2 xs:mt-4">
              {product.old_name}
            </span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center items-center z-10"
          >
            <div className="relative bg-[#3da4c7] text-white p-1 xs:p-2 sm:p-3 rounded-md shadow-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 xs:w-6 xs:h-6 sm:w-8 sm:h-8"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
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
            className="bg-[#17414f] hover:bg-[#0f2a33] dark:bg-[#41bae3] dark:hover:bg-[#3da4c7] text-white rounded-full px-4 xs:px-6 py-4 xs:py-6 text-xs xs:text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 w-1/2"
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
        className=" relative z-10 py-16 md:py-24 bg-white dark:bg-[#1a2e35]"
      >
        <div className="max-w-6xl mx-auto px-4 ">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
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
                  src={bgImageSrc || "/placeholder.svg"}
                  alt={`${product.old_name} bottle`}
                  width={450}
                  height={500}
                  style={{ objectFit: "contain" }}
                  className="absolute drop-shadow-xl w-[250px] h-[300px] sm:w-[500px] sm:h-[500px] object-cover rounded-lg  md:ml-56  opacity-50"
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
                <div className="absolute -top-4 -right-4 w-24 h-24 animate-pulse">
                  <Image
                    src={badgeImageSrc || "/placeholder.svg"}
                    alt="Money Back Guarantee"
                    width={50}
                    height={50}
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

              <p className="text-[#17414f] dark:text-gray-200 mb-6 text-lg ">
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
                    className="flex items-start text-[#17414f] dark:text-gray-200 text-lg"
                  >
                    <div className="mr-3 mt-1 text-[#17414f] dark:text-[#41bae3]">
                      •
                    </div>
                    {point}
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-row items-center gap-6">
                <Button
                  onClick={handleBuyNow}
                  className="bg-[#17414f] hover:bg-[#0f2a33] dark:bg-[#41bae3] dark:hover:bg-[#3da4c7] text-white rounded-full px-8 py-7 text-lg font-bold w-1/2 shadow-lg hover:shadow-xl transition-all duration-300"
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
      <footer className="relative z-10 py-6 bg-[#17414f] dark:bg-[#0f2a33] text-white text-center">
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

// export default function ProductRebrand() {
//   return (
//     <ThemeProvider defaultTheme="light" storageKey="product-rebrand-theme">
//       <ProductRebrandContent />
//     </ThemeProvider>
//   );
// }
