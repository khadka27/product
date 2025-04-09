/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
    // Basic fields
    old_name: "",
    new_name: "",
    description: "",
    next_redirect_url: "",
    redirect_timer: "0",
    theme: "light",

    // SEO fields
    page_title: "",
    seo_title: "",
    meta_description: "",

    // Content fields
    description_points: ["", "", "", ""],
    rename_reason: "",
    metadata: {
      version: "",
      release_date: "",
    },

    // Popup fields
    popup_title: "",
    popup_content: "",

    // Image fields
    old_images: [] as File[],
    new_images: [] as File[],
    badge_image: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [oldImagePreviews, setOldImagePreviews] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [badgeImagePreview, setBadgeImagePreview] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("seo");
  const [showSuccess, setShowSuccess] = useState(false);
  const [activePoints, setActivePoints] = useState<number>(0);

  // Track form completion status
  const [tabCompletion, setTabCompletion] = useState({
    seo: false,
    basic: false,
    images: false,
    content: false,
    settings: true, // Settings tab is optional, so mark as complete by default
  });

  useEffect(() => {
    // Update active points count on component mount
    updateActivePoints();
  }, []);

  useEffect(() => {
    // Update tab completion status
    setTabCompletion({
      ...tabCompletion,
      seo: true, // SEO is optional
      basic:
        !!formData.old_name && !!formData.new_name && !!formData.page_title,
      images: formData.old_images.length > 0 && formData.new_images.length > 0,
      content:
        !!formData.description &&
        formData.description_points.filter((p) => p.trim()).length >= 2,
    });
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value,
      },
    }));
  };

  const handleDescriptionPointChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newPoints = [...prev.description_points];
      newPoints[index] = value;
      return { ...prev, description_points: newPoints };
    });

    // Update the active points count
    updateActivePoints();
  };

  const updateActivePoints = () => {
    const activeCount = formData.description_points.filter(
      (p) => p.trim() !== ""
    ).length;
    setActivePoints(activeCount);
  };

  const addBulletPoint = () => {
    // Add a new empty bullet point
    setFormData((prev) => ({
      ...prev,
      description_points: [...prev.description_points, ""],
    }));

    // Focus the new field after render
    setTimeout(() => {
      const newIndex = formData.description_points.length;
      const element = document.getElementById(`bullet-point-${newIndex}`);
      if (element) {
        element.focus();
      }
    }, 0);
  };

  const removeBulletPoint = (index: number) => {
    setFormData((prev) => {
      const newPoints = [...prev.description_points];
      newPoints.splice(index, 1);
      return { ...prev, description_points: newPoints };
    });

    // Update the active points count
    setTimeout(updateActivePoints, 0);
  };

  const handleThemeChange = (theme: string) => {
    setFormData((prev) => ({ ...prev, theme }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "old" | "new" | "badge"
  ) => {
    const files = Array.from(e.target.files || []);

    if (type === "badge") {
      // For badge, we only take the first file
      if (files.length > 0) {
        setFormData((prev) => ({
          ...prev,
          badge_image: files[0],
        }));
        setBadgeImagePreview(URL.createObjectURL(files[0]));
      }
    } else {
      // For old and new images, we take multiple files
      setFormData((prev) => ({
        ...prev,
        [type === "old" ? "old_images" : "new_images"]: files,
      }));

      // Generate image previews
      const previews = files.map((file) => URL.createObjectURL(file));
      if (type === "old") {
        setOldImagePreviews(previews);
      } else {
        setNewImagePreviews(previews);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();

    // Basic fields
    data.append("old_name", formData.old_name);
    data.append("new_name", formData.new_name);
    data.append("description", formData.description);
    data.append("next_redirect_url", formData.next_redirect_url);
    data.append("redirect_timer", formData.redirect_timer);
    data.append("theme", formData.theme);

    // SEO fields
    data.append("page_title", formData.page_title);
    data.append("seo_title", formData.seo_title);
    data.append("meta_description", formData.meta_description);

    // Content fields
    data.append("rename_reason", formData.rename_reason);

    // Popup fields
    data.append("popup_title", formData.popup_title);
    data.append("popup_content", formData.popup_content);

    // Description points - only append non-empty points
    const nonEmptyPoints = formData.description_points.filter(
      (p) => p.trim() !== ""
    );
    data.append("description_points", JSON.stringify(nonEmptyPoints));

    // Metadata as JSON
    data.append("metadata", JSON.stringify(formData.metadata));

    // Images
    formData.old_images.forEach((file) => data.append("old_images", file));
    formData.new_images.forEach((file) => data.append("new_images", file));

    // Badge image (if exists)
    if (formData.badge_image) {
      data.append("badge_image", formData.badge_image);
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
      const res = await axios.post(`${baseUrl}/api/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        setGeneratedLink(res.data.generatedLink);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
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
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {generatedLink}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedLink)}
                    className="ml-2"
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
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formData.next_redirect_url}
                </a>
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button
              onClick={() => {
                setShowSuccess(false);
                setGeneratedLink(null);
                setFormData({
                  old_name: "",
                  new_name: "",
                  description: "",
                  description_points: ["", "", "", ""],
                  rename_reason: "",
                  metadata: {
                    version: "",
                    release_date: "",
                  },
                  next_redirect_url: "",
                  redirect_timer: "0",
                  theme: "light",
                  page_title: "",
                  seo_title: "",
                  meta_description: "",
                  popup_title: "",
                  popup_content: "",
                  old_images: [],
                  new_images: [],
                  badge_image: null,
                });
                setOldImagePreviews([]);
                setNewImagePreviews([]);
                setBadgeImagePreview(null);
                setActiveTab("seo");
                setActivePoints(0);
              }}
              variant="outline"
            >
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
                      Page Title (HTML Title Tag)
                    </Label>
                    <Input
                      id="seo_title"
                      type="text"
                      name="seo_title"
                      value={formData.seo_title}
                      placeholder="Product Renaming Announcement"
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500">
                      This appears in browser tabs and search results. Leave
                      blank to use the main title.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      name="meta_description"
                      value={formData.meta_description}
                      placeholder="Learn about our product renaming from Product A to Product B and the improvements we've made."
                      onChange={handleChange}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500">
                      This appears in search engine results. Leave blank to use
                      the main description.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="button" onClick={() => setActiveTab("basic")}>
                      Next: Basic Information{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* BASIC INFORMATION TAB */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="page_title">Page Title</Label>
                    <Input
                      id="page_title"
                      type="text"
                      name="page_title"
                      value={formData.page_title}
                      placeholder="Product A has been Renamed to Product B"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="old_name">Old Product Name (From)</Label>
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
                      <Label htmlFor="new_name">New Product Name (To)</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="popup_title">Popup Title</Label>
                    <Input
                      id="popup_title"
                      type="text"
                      name="popup_title"
                      value={formData.popup_title}
                      placeholder="Why We've Renamed Product A to Product B"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("images")}
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
                      <Label htmlFor="old_images">Product 1 Image (From)</Label>
                      <Input
                        id="old_images"
                        type="file"
                        name="old_images"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, "old")}
                        required
                        className="cursor-pointer"
                      />
                      {oldImagePreviews.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">
                            Selected Product 1 images:
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {oldImagePreviews.map((src, index) => (
                              <div
                                key={index}
                                className="relative aspect-square rounded-md overflow-hidden border"
                              >
                                <Image
                                  src={src || "/placeholder.svg"}
                                  alt={`Old image preview ${index + 1}`}
                                  className="object-cover"
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
                      <Label htmlFor="new_images">Product 2 Image (To)</Label>
                      <Input
                        id="new_images"
                        type="file"
                        name="new_images"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, "new")}
                        required
                        className="cursor-pointer"
                      />
                      {newImagePreviews.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">
                            Selected Product 2 images:
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {newImagePreviews.map((src, index) => (
                              <div
                                key={index}
                                className="relative aspect-square rounded-md overflow-hidden border"
                              >
                                <Image
                                  src={src || "/placeholder.svg"}
                                  alt={`New image preview ${index + 1}`}
                                  className="object-cover"
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
                        Badge Image (Optional)
                      </Label>
                      <div className="text-xs text-gray-500 mb-2">
                        Upload a badge or icon to represent this product
                      </div>
                      <Input
                        id="badge_image"
                        type="file"
                        name="badge_image"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "badge")}
                        className="cursor-pointer"
                        required
                      />
                      {badgeImagePreview && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                            <Image
                              src={badgeImagePreview || "/placeholder.svg"}
                              alt="Badge preview"
                              className="object-contain"
                              fill
                              sizes="64px"
                            />
                          </div>
                          <div className="text-sm text-gray-500">
                            Badge image preview
                          </div>
                        </div>
                      )}
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
                    >
                      Next: Content <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* CONTENT TAB */}
                <TabsContent value="content" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
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
                      <Label htmlFor="bullet_points">Bullet Points</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="rename_reason">
                      Why Rename? (Popup Content)
                    </Label>
                    <Textarea
                      id="popup_content"
                      name="popup_content"
                      value={formData.popup_content}
                      placeholder="After extensive market research and customer feedback..."
                      onChange={handleChange}
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-gray-500">
                      This content will appear in a popup explaining the rename.
                      Separate paragraphs with blank lines.
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
                    >
                      Next: Settings <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="next_redirect_url">Redirect URL</Label>
                      <Input
                        id="next_redirect_url"
                        type="url"
                        name="next_redirect_url"
                        value={formData.next_redirect_url}
                        placeholder="https://example.com/product"
                        onChange={handleChange}
                      />
                      <p className="text-xs text-gray-500">
                        Where to redirect users after viewing the page
                        (optional)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="redirect_timer">
                        Redirect Timer (seconds)
                      </Label>
                      <Input
                        id="redirect_timer"
                        type="number"
                        name="redirect_timer"
                        min="0"
                        max="300"
                        value={formData.redirect_timer}
                        onChange={handleChange}
                      />
                      <p className="text-xs text-gray-500">
                        0 = no automatic redirect
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Theme</Label>
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
                      disabled={isSubmitting}
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
