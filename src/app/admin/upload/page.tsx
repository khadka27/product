/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  Upload,
  Sun,
  Moon,
  Tag,
  Plus,
  Trash2,
  Copy,
  ArrowRight,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UploadPage() {
  const [formData, setFormData] = useState({
    old_name: "",
    new_name: "",
    description: "",
    next_redirect_url: "",
    redirect_timer: "0",
    theme: "light",
    seo_title: "",
    meta_description: "",
    description_points: ["", "", "", ""],
    old_images: [] as File[],
    new_images: [] as File[],
    badge_image_url: null as File | null,
    extra_badge_1: null as File | null,
    extra_badge_2: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [oldImagePreviews, setOldImagePreviews] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [badgeImagePreview, setBadgeImagePreview] = useState<string | null>(
    null
  );
  const [extraBadge1Preview, setExtraBadge1Preview] = useState<string | null>(
    null
  );
  const [extraBadge2Preview, setExtraBadge2Preview] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("seo");
  const [showSuccess, setShowSuccess] = useState(false);
  const [activePoints, setActivePoints] = useState(0);

  const [tabCompletion, setTabCompletion] = useState({
    seo: false,
    basic: false,
    images: false,
    content: false,
    settings: false,
  });

  // Check if the current tab has all required fields filled
  const [canProceed, setCanProceed] = useState({
    seo: false,
    basic: false,
    images: false,
    content: false,
    settings: false,
  });

  useEffect(() => {
    updateActivePoints();
  }, []);

  useEffect(() => {
    setTabCompletion({
      seo: !!formData.seo_title && !!formData.meta_description,
      basic: !!formData.old_name && !!formData.new_name,
      images:
        formData.old_images.length > 0 &&
        formData.new_images.length > 0 &&
        !!formData.badge_image_url,
      content:
        !!formData.description &&
        formData.description_points.filter((p) => p.trim()).length >= 2,
      settings: !!formData.next_redirect_url && formData.redirect_timer !== "",
    });

    // Update canProceed state
    setCanProceed({
      seo: !!formData.seo_title && !!formData.meta_description,
      basic: !!formData.old_name && !!formData.new_name,
      images:
        formData.old_images.length > 0 &&
        formData.new_images.length > 0 &&
        !!formData.badge_image_url,
      content:
        !!formData.description &&
        formData.description_points.filter((p) => p.trim()).length >= 2,
      settings: !!formData.next_redirect_url && formData.redirect_timer !== "",
    });
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionPointChange = (index: number, value: string) => {
    setFormData((prev) => {
      const pts = [...prev.description_points];
      pts[index] = value;
      return { ...prev, description_points: pts };
    });
    updateActivePoints();
  };

  const updateActivePoints = () => {
    setActivePoints(
      formData.description_points.filter((p) => p.trim() !== "").length
    );
  };

  const addBulletPoint = () => {
    setFormData((prev) => ({
      ...prev,
      description_points: [...prev.description_points, ""],
    }));
    setTimeout(() => {
      const idx = formData.description_points.length;
      document.getElementById(`bullet-point-${idx}`)?.focus();
    }, 0);
  };

  const removeBulletPoint = (index: number) => {
    setFormData((prev) => {
      const pts = [...prev.description_points];
      pts.splice(index, 1);
      return { ...prev, description_points: pts };
    });
    setTimeout(updateActivePoints, 0);
  };

  const handleThemeChange = (theme: string) =>
    setFormData((prev) => ({ ...prev, theme }));

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "old" | "new" | "badge_image" | "extra_badge_1" | "extra_badge_2"
  ) => {
    const files = Array.from(e.target.files || []);
    if (["badge_image", "extra_badge_1", "extra_badge_2"].includes(type)) {
      if (files.length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...(type === "badge_image" && { badge_image_url: files[0] }),
          ...(type === "extra_badge_1" && { extra_badge_1: files[0] }),
          ...(type === "extra_badge_2" && { extra_badge_2: files[0] }),
        }));
        const url = URL.createObjectURL(files[0]);
        if (type === "badge_image") setBadgeImagePreview(url);
        if (type === "extra_badge_1") setExtraBadge1Preview(url);
        if (type === "extra_badge_2") setExtraBadge2Preview(url);
      }
    } else {
      const field = type === "old" ? "old_images" : "new_images";
      setFormData((prev) => ({ ...prev, [field]: files }));
      const previews = files.map((f) => URL.createObjectURL(f));
      if (type === "old") setOldImagePreviews(previews);
      else setNewImagePreviews(previews);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append("old_name", formData.old_name);
    data.append("new_name", formData.new_name);
    data.append("description", formData.description);
    data.append("next_redirect_url", formData.next_redirect_url);
    data.append("redirect_timer", formData.redirect_timer);
    data.append("theme", formData.theme);
    data.append("seo_title", formData.seo_title);
    data.append("meta_description", formData.meta_description);
    data.append(
      "description_points",
      JSON.stringify(formData.description_points.filter((p) => p.trim()))
    );
    formData.old_images.forEach((f) => data.append("old_images", f));
    formData.new_images.forEach((f) => data.append("new_images", f));
    if (formData.badge_image_url)
      data.append("badge_image", formData.badge_image_url);
    if (formData.extra_badge_1)
      data.append("extra_badge_1_image", formData.extra_badge_1);
    if (formData.extra_badge_2)
      data.append("extra_badge_2_image", formData.extra_badge_2);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
      const res = await axios.post(`${baseUrl}/api/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        setGeneratedLink(res.data.generatedLink);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Upload Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Your product has been uploaded successfully.</p>
            {generatedLink && (
              <div className="mb-6">
                <p className="mb-2 font-semibold">Generated Link:</p>
                <div className="bg-gray-100 p-3 rounded-md break-all flex items-center justify-between">
                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {generatedLink}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {formData.next_redirect_url && (
              <p className="mb-6">
                Redirect URL:{" "}
                <a
                  href={formData.next_redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {formData.next_redirect_url}
                </a>
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Upload Another Product
            </Button>
            {generatedLink && (
              <Button onClick={() => window.open(generatedLink, "_blank")}>
                View Product Page
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Product Rename Comparison Upload
        </h2>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">
              Product Renaming Page Generator
            </CardTitle>
            <CardDescription>
              Create a comparison page to announce your product renaming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="seo" className="relative">
                  SEO Settings
                  {tabCompletion.seo && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="basic" className="relative">
                  Basic Info
                  {tabCompletion.basic && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="images" className="relative">
                  Images
                  {tabCompletion.images && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="content" className="relative">
                  Content
                  {tabCompletion.content && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="relative">
                  Settings
                  {tabCompletion.settings && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* SEO SETTINGS TAB */}
                <TabsContent value="seo" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title">
                      Page Title (HTML Title Tag){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="seo_title"
                      type="text"
                      name="seo_title"
                      value={formData.seo_title}
                      placeholder="Product Renaming Announcement"
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      This appears in browser tabs and search results.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">
                      Meta Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="meta_description"
                      name="meta_description"
                      value={formData.meta_description}
                      placeholder="Learn about our product renaming from Product A to Product B and the improvements we've made."
                      onChange={handleChange}
                      className="min-h-[80px]"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      This appears in search engine results.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("basic")}
                      disabled={!canProceed.seo}
                    >
                      Next: Basic Information{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* BASIC INFORMATION TAB */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="old_name">
                        Old Product Name (From){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="old_name"
                        type="text"
                        name="old_name"
                        value={formData.old_name}
                        placeholder="Product A"
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_name">
                        New Product Name (To){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="new_name"
                        type="text"
                        name="new_name"
                        value={formData.new_name}
                        placeholder="Product B"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("seo")}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("images")}
                      disabled={!canProceed.basic}
                    >
                      Next: Upload Images{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* IMAGES TAB */}
                <TabsContent value="images" className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="old_images">
                        Product 1 Image (From){" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      {oldImagePreviews.length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                          <input
                            id="old_images"
                            type="file"
                            name="old_images"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, "old")}
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ImagePlus className="h-10 w-10 text-gray-400" />
                            <p className="text-sm font-medium">
                              Click to upload old product images
                            </p>
                            <p className="text-xs text-gray-500">
                              SVG, PNG, JPG or GIF (Max. 5MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium">
                              Selected Product 1 images:
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOldImagePreviews([]);
                                setFormData((prev) => ({
                                  ...prev,
                                  old_images: [],
                                }));
                              }}
                            >
                              Change Images
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {oldImagePreviews.map((src, index) => (
                              <div
                                key={index}
                                className="relative aspect-square rounded-md overflow-hidden border shadow-sm group"
                              >
                                <Image
                                  src={src || "/placeholder.svg"}
                                  alt={`Old image preview ${index + 1}`}
                                  className="object-cover transition-transform group-hover:scale-105"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  priority
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_images">
                        Product 2 Image (To){" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      {newImagePreviews.length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                          <input
                            id="new_images"
                            type="file"
                            name="new_images"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, "new")}
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ImagePlus className="h-10 w-10 text-gray-400" />
                            <p className="text-sm font-medium">
                              Click to upload new product images
                            </p>
                            <p className="text-xs text-gray-500">
                              SVG, PNG, JPG or GIF (Max. 5MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium">
                              Selected Product 2 images:
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewImagePreviews([]);
                                setFormData((prev) => ({
                                  ...prev,
                                  new_images: [],
                                }));
                              }}
                            >
                              Change Images
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {newImagePreviews.map((src, index) => (
                              <div
                                key={index}
                                className="relative aspect-square rounded-md overflow-hidden border shadow-sm group"
                              >
                                <Image
                                  src={src || "/placeholder.svg"}
                                  alt={`New image preview ${index + 1}`}
                                  className="object-cover transition-transform group-hover:scale-105"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="badge_image">
                        Main Badge Image <span className="text-red-500">*</span>
                      </Label>

                      {!badgeImagePreview ? (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                          <input
                            id="badge_image"
                            type="file"
                            name="badge_image"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, "badge_image")}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required
                          />
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ImagePlus className="h-8 w-8 text-gray-400" />
                            <p className="text-sm font-medium">
                              Click to upload badge image
                            </p>
                            <p className="text-xs text-gray-500">
                              Upload a badge or icon to represent this product
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-md overflow-hidden border shadow-sm">
                            <Image
                              src={badgeImagePreview || "/placeholder.svg"}
                              alt="Badge preview"
                              className="object-contain"
                              fill
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">
                              Main badge image
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBadgeImagePreview(null);
                                setFormData((prev) => ({
                                  ...prev,
                                  badge_image_url: null,
                                }));
                              }}
                            >
                              Change Image
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="extra_badge_1">
                          Extra Badge 1 (Optional)
                        </Label>

                        {!extraBadge1Preview ? (
                          <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors relative h-[120px]">
                            <input
                              id="extra_badge_1"
                              type="file"
                              name="extra_badge_1"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(e, "extra_badge_1")
                              }
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center gap-1 h-full">
                              <ImagePlus className="h-6 w-6 text-gray-400" />
                              <p className="text-sm">Upload extra badge</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                              <Image
                                src={extraBadge1Preview || "/placeholder.svg"}
                                alt="Extra badge 1 preview"
                                className="object-contain"
                                fill
                                sizes="64px"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setExtraBadge1Preview(null);
                                setFormData((prev) => ({
                                  ...prev,
                                  extra_badge_1: null,
                                }));
                              }}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="extra_badge_2">
                          Extra Badge 2 (Optional)
                        </Label>

                        {!extraBadge2Preview ? (
                          <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors relative h-[120px]">
                            <input
                              id="extra_badge_2"
                              type="file"
                              name="extra_badge_2"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(e, "extra_badge_2")
                              }
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center gap-1 h-full">
                              <ImagePlus className="h-6 w-6 text-gray-400" />
                              <p className="text-sm">Upload extra badge</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                              <Image
                                src={extraBadge2Preview || "/placeholder.svg"}
                                alt="Extra badge 2 preview"
                                className="object-contain"
                                fill
                                sizes="64px"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setExtraBadge2Preview(null);
                                setFormData((prev) => ({
                                  ...prev,
                                  extra_badge_2: null,
                                }));
                              }}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("content")}
                      disabled={!canProceed.images}
                    >
                      Next: Content <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* CONTENT TAB */}
                <TabsContent value="content" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      placeholder="We've made significant improvements to our formula and branding..."
                      onChange={handleChange}
                      required
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="bullet_points">
                        Bullet Points <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addBulletPoint}
                              className="h-8 px-2"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Point
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add another bullet point</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {formData.description_points.map((point, index) => (
                        <div className="flex gap-2 items-start" key={index}>
                          <div className="bg-primary/10 text-primary rounded-full p-1 mt-1 flex-shrink-0">
                            <Tag className="h-4 w-4" />
                          </div>
                          <Input
                            id={`bullet-point-${index}`}
                            value={point}
                            onChange={(e) =>
                              handleDescriptionPointChange(
                                index,
                                e.target.value
                              )
                            }
                            placeholder={`Description point ${index + 1}`}
                            required={index < 2}
                          />
                          {index >= 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBulletPoint(index)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      At least 2 bullet points are required. You can add as many
                      as needed.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("images")}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("settings")}
                      disabled={!canProceed.content}
                    >
                      Next: Settings <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="next_redirect_url">
                        Redirect URL <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="next_redirect_url"
                        type="url"
                        name="next_redirect_url"
                        value={formData.next_redirect_url}
                        placeholder="https://example.com/product"
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Where to redirect users after viewing the page
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="redirect_timer">
                        Redirect Timer (seconds){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="redirect_timer"
                        type="number"
                        name="redirect_timer"
                        min="0"
                        max="300"
                        value={formData.redirect_timer}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        0 = no automatic redirect
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>
                      Theme <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                          formData.theme === "light"
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleThemeChange("light")}
                      >
                        <Sun className="h-10 w-10 mb-2" />
                        <span className="font-medium">Light Mode</span>
                      </div>
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                          formData.theme === "dark"
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleThemeChange("dark")}
                      >
                        <Moon className="h-10 w-10 mb-2" />
                        <span className="font-medium">Dark Mode</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("content")}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !canProceed.settings}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Generate Files
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
