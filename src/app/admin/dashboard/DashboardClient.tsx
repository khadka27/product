/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  BarChart2,
  Eye,
  Globe,
} from "lucide-react";
import Navbar from "@/components/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signOut } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type Product = {
  id: string;
  old_name: string;
  new_name: string;
  description: string;
  old_images: string; // JSON stringified array
  new_images: string; // JSON stringified array
  next_redirect_url: string;
  theme: string;
  generated_link: string;
  total_clicks: number;
};

// Type for analytics data
type AnalyticsData = {
  totalProducts: number;
  totalClicks: number;
  totalUniqueVisitors: number;
  topCountries: { country: string; count: number }[];
  products: Product[];
};

// Type for individual product analytics
type ProductAnalytics = {
  totalClicks: number;
  uniqueVisitors: number;
  countries: { country: string; count: number }[];
};

// Custom colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

export default function DashboardClient({ user }: { user?: any }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("yearly");

  // Fetch all products and analytics data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/products`
        );
        setProducts(productsRes.data);

        // Fetch analytics data
        const analyticsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/analytics?sort=clicks`
        );
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    });
  };

  // Copy a given link to clipboard
  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Failed to copy link.");
    }
  };

  // Redirect to edit page
  const handleEdit = (id: string) => {
    router.push(`${process.env.NEXT_PUBLIC_SITE_URL}/admin/edit-product/${id}`);
  };

  // Delete product and refresh list
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/product/${id}`
        );
        alert("Product deleted successfully");
        // Refresh products and analytics
        const productsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/products`
        );
        setProducts(productsRes.data);

        const analyticsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/analytics?sort=clicks`
        );
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete product.");
      }
    }
  };

  // View detailed analytics for a product
  const handleViewAnalytics = (id: string) => {
    router.push(`${process.env.NEXT_PUBLIC_SITE_URL}/admin/analytics/${id}`);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.new_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.old_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Prepare data for country distribution pie chart
  const countryPieData =
    analytics?.topCountries.map((country) => ({
      name: country.country,
      value: country.count,
    })) || [];

  // Format products data for bar chart (top 5 products by views)
  const productBarData =
    analytics?.products.slice(0, 5).map((product) => ({
      name: product.new_name || product.old_name,
      clicks: product.total_clicks || 0,
    })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto p-6">
        <Tabs defaultValue="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your product listings and view analytics
              </p>
            </div>
            <TabsList className="mt-4 sm:mt-0">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalProducts || products.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {products.length > 0
                      ? "View all products below"
                      : "Add your first product"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalClicks || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all products
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unique Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalUniqueVisitors || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unique IP addresses
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Product Listings</CardTitle>
                    <CardDescription>
                      Manage your product catalog
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-8 w-full sm:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => router.push("/admin/upload")}>
                      Add New Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                  {filteredProducts.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Product Details
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Configuration
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Analytics
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Images
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-muted/20">
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {product.new_name || product.old_name}
                                </span>
                                <span className="text-sm text-muted-foreground mt-1">
                                  ID: {product.id.substring(0, 8)}...
                                </span>
                                {product.description && (
                                  <p className="text-sm text-muted-foreground mt-2 max-w-md">
                                    {product.description?.length > 100
                                      ? `${product.description.substring(
                                          0,
                                          100
                                        )}...`
                                      : product.description}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col space-y-2">
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Theme:
                                  </span>
                                  <span className="ml-2 text-sm">
                                    {product.theme || "Default"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Redirect URL:
                                  </span>
                                  <span className="ml-2 text-sm">
                                    {product.next_redirect_url || "None"}
                                  </span>
                                </div>
                                {product.generated_link && (
                                  <div className="flex items-center mt-2">
                                    <a
                                      href={product.generated_link}
                                      className="text-primary text-sm flex items-center mr-2"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      View
                                    </a>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() =>
                                        handleCopyLink(product.generated_link)
                                      }
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy Link
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center">
                                  <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{product.total_clicks || 0} views</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    handleViewAnalytics(product.id)
                                  }
                                >
                                  <BarChart2 className="h-3 w-3 mr-1" />
                                  View Stats
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-4">
                                <div>
                                  <span className="text-xs text-muted-foreground block mb-1">
                                    Old:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {JSON.parse(product.old_images || "[]")
                                      .slice(0, 3)
                                      .map((img: string, index: number) => (
                                        <img
                                          key={index}
                                          src={
                                            img ||
                                            "/placeholder.svg?height=48&width=48" ||
                                            "/placeholder.svg"
                                          }
                                          alt={`Old image ${index + 1}`}
                                          className="h-12 w-12 object-cover rounded border"
                                        />
                                      ))}
                                    {JSON.parse(product.old_images || "[]")
                                      .length > 3 && (
                                      <div className="h-12 w-12 flex items-center justify-center bg-muted rounded border">
                                        <span className="text-xs">
                                          +
                                          {JSON.parse(
                                            product.old_images || "[]"
                                          ).length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground block mb-1">
                                    New:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {JSON.parse(product.new_images || "[]")
                                      .slice(0, 3)
                                      .map((img: string, index: number) => (
                                        <img
                                          key={index}
                                          src={
                                            img ||
                                            "/placeholder.svg?height=48&width=48" ||
                                            "/placeholder.svg"
                                          }
                                          alt={`New image ${index + 1}`}
                                          className="h-12 w-12 object-cover rounded border"
                                        />
                                      ))}
                                    {JSON.parse(product.new_images || "[]")
                                      .length > 3 && (
                                      <div className="h-12 w-12 flex items-center justify-center bg-muted rounded border">
                                        <span className="text-xs">
                                          +
                                          {JSON.parse(
                                            product.new_images || "[]"
                                          ).length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => handleEdit(product.id)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="w-full justify-start"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? "No products match your search."
                          : "No products available."}
                      </p>
                      {!searchTerm && (
                        <Button
                          className="mt-4"
                          onClick={() => router.push("/admin/upload")}
                        >
                          Add Your First Product
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalProducts || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalClicks || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unique Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalUniqueVisitors || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products by Views</CardTitle>
                  <CardDescription>
                    Most popular products based on view count
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="clicks"
                          fill="hsl(var(--primary))"
                          name="Total Views"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visitor Geography</CardTitle>
                  <CardDescription>
                    Breakdown of visitors by country
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={countryPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {countryPieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>
                  Products with the highest view counts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {product.new_name || product.old_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.total_clicks || 0} views
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAnalytics(product.id)}
                        >
                          <BarChart2 className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/admin/analytics")}
                >
                  View All Analytics
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your account information
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how you receive notifications
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">API Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your API keys and webhooks
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleLogout}>
                  Log Out
                </Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
