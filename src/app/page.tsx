"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = {
  item_id: number;
  item_name: string;
  description: string | null;
  price: string | number;
  is_available: boolean;
  category_id: number;
  category_name: string;
  image_url: string | null;
};

type Order = {
  order_id: number;
  customer_name: string;
  order_date: string;
  total_amount: string | number;
  order_status: string;
  items: {
    item_name: string;
    quantity: number;
  }[];
};

type InventoryItem = {
  inventory_id: number;
  ingredient_name: string;
  quantity: string | number;
  unit: string;
  minimum_stock: string | number;
  last_updated: string;
  supplier_name: string | null;
};

type InventoryTransaction = {
  transaction_id: number;
  inventory_id: number;
  ingredient_name: string;
  transaction_type: "STOCK_IN" | "STOCK_OUT";
  quantity: string | number;
  unit: string;
  transaction_date: string;
  notes: string | null;
};

type ReportsData = {
  summary: {
    total_orders: number;
    total_revenue: string | number;
    completed_orders: number;
    cancelled_orders: number;
  };
  dailySales: {
    sale_date: string;
    total_orders: number;
    total_revenue: string | number;
  }[];
  popularItems: {
    item_name: string;
    total_quantity: number;
    total_revenue: string | number;
  }[];
  lowStockItems: {
    inventory_id: number;
    ingredient_name: string;
    quantity: string | number;
    unit: string;
    minimum_stock: string | number;
  }[];
};

type Feedback = {
  _id: string;
  customer_name: string;
  food_item: string;
  rating: number;
  comment: string;
  created_at?: string;
};

export default function Home() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<
  "ADMIN" | "STAFF" | "CUSTOMER" | null
>(null);


  
  async function handleLogout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    router.replace("/login");
    router.refresh();
  } catch (error) {
    console.error("Logout error:", error);
    alert("Unable to logout. Please try again.");
  }
}

  const [activeTab, setActiveTab] = useState("Overview");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<{
  full_name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  
} | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  // Admin food management states
const [showFoodForm, setShowFoodForm] = useState(false);
const [foodName, setFoodName] = useState("");
const [foodDescription, setFoodDescription] = useState("");
const [foodPrice, setFoodPrice] = useState("");
const [foodCategory, setFoodCategory] = useState("Breakfast");
const [foodAvailable, setFoodAvailable] = useState(true);
const [foodSaving, setFoodSaving] = useState(false);
const [foodMessage, setFoodMessage] = useState("");

// Food image upload
const [foodImage, setFoodImage] = useState<File | null>(null);
const [existingFoodImage, setExistingFoodImage] = useState("");

// Admin: Edit food states
const [editingFoodId, setEditingFoodId] = useState<number | null>(null);
const [foodUpdating, setFoodUpdating] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");

  const [reports, setReports] = useState<ReportsData | null>(null);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");

  // Customer feedback states (MongoDB)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [foodItem, setFoodItem] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Add Stock state
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockNotes, setStockNotes] = useState("");
  const [stockMessage, setStockMessage] = useState("");
  const [stockSubmitting, setStockSubmitting] = useState(false);
  const [stockSuccess, setStockSuccess] = useState(false);

  // Remove Stock state
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeNotes, setRemoveNotes] = useState("");
  const [removeMessage, setRemoveMessage] = useState("");
  const [removeSubmitting, setRemoveSubmitting] = useState(false);
  const [removeSuccess, setRemoveSuccess] = useState(false);

  const categories = ["All", "Breakfast", "Lunch", "Snacks", "Drinks"];

  // Fetch menu items
  async function fetchMenu() {
    try {
      setMenuLoading(true);
      setMenuError("");

      const response = await fetch("/api/menu");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load menu");
      }

      setMenuItems(data.menu);
    } catch (error) {
      console.error("Menu loading error:", error);
      setMenuError("Unable to load food items. Please try again.");
    } finally {
      setMenuLoading(false);
    }
  }
  // Upload selected food photo
async function uploadFoodImage(): Promise<string | null> {
  if (!foodImage) return null;

  const formData = new FormData();
  formData.append("image", foodImage);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Image upload failed.");
  }

  return data.image_url;
}
  // Admin: Add a new food item
async function saveFoodItem() {
  try {
    setFoodSaving(true);
    setFoodMessage("");
    const uploadedImageUrl = await uploadFoodImage();

    const response = await fetch("/api/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_name: foodName.trim(),
        description: foodDescription.trim(),
        price: Number(foodPrice),
       image_url: existingFoodImage || uploadedImageUrl,
        category_id: {
          Breakfast: 1,
          Lunch: 2,
          Snacks: 3,
          Drinks: 4,
        }[foodCategory],
        is_available: foodAvailable,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to add food item.");
    }

    setFoodMessage("Food item added successfully!");
    setFoodName("");
    setFoodDescription("");
    setFoodPrice("");
    setFoodCategory("Breakfast");
    setFoodAvailable(true);
    setFoodImage(null);
    setExistingFoodImage("");
    setShowFoodForm(false);

    await fetchMenu();
  } catch (error) {
    setFoodMessage(
      error instanceof Error
        ? error.message
        : "Unable to add food item."
    );
  } finally {
    setFoodSaving(false);
  }
}// Admin: Update an existing food item
async function updateFoodItem() {
  if (editingFoodId === null) return;

  try {
    setFoodUpdating(true);
    setFoodMessage("");
    const uploadedImageUrl = await uploadFoodImage();

    const response = await fetch("/api/menu", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: editingFoodId,
        item_name: foodName.trim(),
        description: foodDescription.trim(),
        price: Number(foodPrice),
        image_url: existingFoodImage || uploadedImageUrl,
        category_id: {
          Breakfast: 1,
          Lunch: 2,
          Snacks: 3,
          Drinks: 4,
        }[foodCategory],
        is_available: foodAvailable,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to update food item.");
    }

    setFoodMessage("Food item updated successfully!");
    setEditingFoodId(null);
    setShowFoodForm(false);
    setFoodImage(null);
    

    await fetchMenu();
  } catch (error) {
    setFoodMessage(
      error instanceof Error
        ? error.message
        : "Unable to update food item."
    );
  } finally {
    setFoodUpdating(false);
  }
}
// Admin: Delete a food item
async function deleteFoodItem(itemId: number) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this food item?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch("/api/menu", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: itemId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to delete food item.");
    }

    setFoodMessage("Food item deleted successfully!");
    await fetchMenu();
  } catch (error) {
    setFoodMessage(
      error instanceof Error
        ? error.message
        : "Unable to delete food item."
    );
  }
}
  // Fetch orders
  async function fetchOrders() {
    try {
      setOrdersLoading(true);
      setOrdersError("");

      const response = await fetch("/api/orders");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load orders");
      }

      setOrders(data.orders);
    } catch (error) {
      console.error("Orders loading error:", error);
      setOrdersError("Unable to load orders. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  }

  // Fetch inventory
  async function fetchInventory() {
    try {
      setInventoryLoading(true);
      setInventoryError("");

      const response = await fetch("/api/inventory");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load inventory");
      }

      setInventoryItems(data.inventory);

      if (data.inventory.length > 0) {
        setSelectedInventoryId((current) => {
          const exists = data.inventory.some(
            (item: InventoryItem) =>
              String(item.inventory_id) === current
          );

          return exists
            ? current
            : String(data.inventory[0].inventory_id);
        });
      }
    } catch (error) {
      console.error("Inventory loading error:", error);
      setInventoryError("Unable to load inventory. Please try again.");
    } finally {
      setInventoryLoading(false);
    }
  }

  // Fetch inventory transaction history
  async function fetchTransactions() {
    try {
      setTransactionsLoading(true);
      setTransactionsError("");

      const response = await fetch("/api/inventory/transactions");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load transaction history"
        );
      }

      setTransactions(data.transactions);
    } catch (error) {
      console.error("Transaction history error:", error);
      setTransactionsError(
        "Unable to load transaction history. Please try again."
      );
    } finally {
      setTransactionsLoading(false);
    }
  }

  // Fetch reports from PostgreSQL
  async function fetchReports() {
    try {
      setReportsLoading(true);
      setReportsError("");

      const response = await fetch("/api/reports");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load reports");
      }

      setReports(data);
    } catch (error) {
      console.error("Reports loading error:", error);
      setReportsError("Unable to load reports. Please try again.");
    } finally {
      setReportsLoading(false);
    }
  }

  // Fetch customer feedback from MongoDB
  async function fetchFeedback() {
    try {
      setFeedbackLoading(true);
      setFeedbackError("");

      const response = await fetch("/api/feedback");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load feedback");
      }

      setFeedbacks(data.feedback || []);
      setTotalReviews(data.totalReviews || 0);
      setAverageRating(Number(data.averageRating) || 0);
    } catch (error) {
      console.error("Feedback loading error:", error);
      setFeedbackError("Unable to load customer feedback. Please try again.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  // Submit customer feedback to MongoDB
  async function submitFeedback() {
  if (feedbackSubmitting) return;

  if (!customerName.trim()) {
    setFeedbackSuccess(false);
    setFeedbackMessage("Please enter your name.");
    return;
  }

  if (!foodItem) {
    setFeedbackSuccess(false);
    setFeedbackMessage("Please select a food item.");
    return;
  }

  if (!feedbackComment.trim()) {
    setFeedbackSuccess(false);
    setFeedbackMessage("Please enter your feedback.");
    return;
  }

  const ratingValue = Number(feedbackRating);

  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    setFeedbackSuccess(false);
    setFeedbackMessage("Please select a valid rating.");
    return;
  }

  setFeedbackSubmitting(true);
  setFeedbackMessage("");
  setFeedbackSuccess(false);

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName.trim(),
        food_item: foodItem,
        rating: ratingValue,
        comment: feedbackComment.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to submit feedback");
    }

    setFeedbackSuccess(true);
    setFeedbackMessage(
      "Thank you! Your feedback was submitted successfully."
    );

    setCustomerName("");
    setFoodItem("");
    setFeedbackRating("5");
    setFeedbackComment("");

    // Only Admin and Staff can retrieve all customer reviews.
    if (userRole === "ADMIN" || userRole === "STAFF") {
      await fetchFeedback();
    }

  } catch (error) {
    console.error("Feedback submission error:", error);

    setFeedbackSuccess(false);
    setFeedbackMessage(
      error instanceof Error
        ? error.message
        : "Unable to submit feedback."
    );
  } finally {
    setFeedbackSubmitting(false);
  }
}
 // Initial data loading based on user role
useEffect(() => {
  async function loadDashboard() {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!response.ok || !data.authenticated || !data.user) {
        router.replace("/login");
        return;
      }

      const role = data.user.role;
      setUserRole(role);
      setCurrentUser(data.user);

      await Promise.all([
        fetchMenu(),
        fetchOrders(),
      ]);

      if (role === "ADMIN") {
        await Promise.all([
          fetchInventory(),
          fetchTransactions(),
        ]);
      } else {
        setInventoryLoading(false);
        setTransactionsLoading(false);
      }

      if (role === "ADMIN" || role === "STAFF") {
        await Promise.all([
          fetchReports(),
          fetchFeedback(),
        ]);
      } else {
        setReportsLoading(false);
        setFeedbackLoading(false);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    }
  }

  loadDashboard();
}, []);
  // Filter menu by category
  const filteredItems =
    category === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category_name === category
        );

  // Calculate cart total
  const total = cart.reduce((sum, id) => {
    const item = menuItems.find(
      (food) => food.item_id === id
    );

    return sum + (Number(item?.price) || 0);
  }, 0);

  // Add food to cart
  function addToCart(id: number) {
    setCart((current) => [...current, id]);
    setOrderMessage("");
  }

  // Place order
  async function placeOrder() {
    if (cart.length === 0 || placingOrder) return;

    setPlacingOrder(true);
    setOrderMessage("");
    setOrderSuccess(false);

    const groupedItems = Object.values(
      cart.reduce(
        (acc, id) => {
          if (!acc[id]) {
            acc[id] = {
              item_id: id,
              quantity: 0,
            };
          }

          acc[id].quantity += 1;
          return acc;
        },
        {} as Record<number, { item_id: number; quantity: number }>
      )
    );

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: groupedItems,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to place order");
      }

      setOrderSuccess(true);
      setOrderMessage("Order placed successfully!");
      setCart([]);
      await Promise.all([
        fetchOrders(),
        fetchReports(),
      ]);
    } catch (error) {
      console.error("Order placement error:", error);
      setOrderSuccess(false);
      setOrderMessage(
        error instanceof Error
          ? error.message
          : "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }
    // Calculate today's orders
  const todayOrders = orders.filter((order) => {
    return (
      new Date(order.order_date).toDateString() ===
      new Date().toDateString()
    );
  });

  // Calculate today's revenue
  const todayRevenue = todayOrders
    .filter((order) => order.order_status !== "CANCELLED")
    .reduce(
      (total, order) => total + Number(order.total_amount),
      0
    );

  // Identify low-stock ingredients
  const lowStockItems: InventoryItem[] = inventoryItems.filter(
    (item: InventoryItem) =>
      Number(item.quantity) <= Number(item.minimum_stock)
  );
    // Overview
   
  function renderOverview() {
    return (
      <div className="space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h2 className="text-2xl font-bold">Dashboard Overview</h2>
    <p className="mt-1 text-slate-500">
      Welcome to Smart Canteen Management System.
    </p>
  </div>

  {currentUser && (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
        {currentUser.full_name
          .split(" ")
          .map((name) => name[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </div>

      <div>
        <p className="font-semibold text-slate-800">
          {currentUser.full_name}
        </p>
        <p className="text-xs text-slate-500">{currentUser.email}</p>
        <span className="text-xs font-semibold text-orange-600">
          {currentUser.role}
        </span>
      </div>
    </div>
  )}
</div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Today's Orders</p>
            <h3 className="mt-2 text-3xl font-bold">{todayOrders.length}</h3>
            <p className="mt-2 text-sm text-blue-600">Orders received today</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Today's Revenue</p>
            <h3 className="mt-2 text-3xl font-bold">
              ₹{todayRevenue.toFixed(2)}
            </h3>
            <p className="mt-2 text-sm text-green-600">Today's sales</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Menu Items</p>
            <h3 className="mt-2 text-3xl font-bold">{menuItems.length}</h3>
            <p className="mt-2 text-sm text-purple-600">Available food items</p>
          </div>

          {userRole === "ADMIN" && (
  <div className="rounded-2xl bg-white p-6 shadow-sm">
    <p className="text-sm text-slate-500">Low Stock Items</p>
    <h3 className="mt-2 text-3xl font-bold">
      {lowStockItems.length}
    </h3>
    <p className="mt-2 text-sm text-red-600">Need restocking</p>
  </div>
)}
        </div>

       <div className="grid gap-6 xl:grid-cols-2">
  <section className="rounded-2xl bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold">Recent Orders</h3>
      <button
        onClick={() => setActiveTab("Orders")}
        className="text-sm font-semibold text-orange-600"
      >
        View All
      </button>
    </div>
    {renderOrdersTable()}
  </section>

  {userRole === "ADMIN" && (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold">Low Stock Alerts</h3>

      {inventoryLoading ? (
        <p className="mt-5 text-slate-500">Loading inventory...</p>
      ) : inventoryError ? (
        <p className="mt-5 text-red-600">{inventoryError}</p>
      ) : lowStockItems.length === 0 ? (
        <p className="mt-5 text-slate-500">
          All inventory items have sufficient stock.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {lowStockItems.map((item) => (
            <div
              key={item.inventory_id}
              className="flex items-center justify-between rounded-xl bg-red-50 p-4"
            >
              <div>
                <p className="font-semibold">{item.ingredient_name}</p>
                <p className="text-sm text-slate-500">
                  Minimum: {item.minimum_stock} {item.unit}
                </p>
              </div>
              <p className="font-bold text-red-600">
                {item.quantity} {item.unit}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )}
</div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Quick Actions</h3>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("Food Menu")}
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
            >
              🍽️ View Food Menu
            </button>

            <button
              onClick={() => setActiveTab("Orders")}
              className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700"
            >
              📦 Manage Orders
            </button>

           {userRole === "ADMIN" && (
  <button
    onClick={() => setActiveTab("Inventory")}
    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
  >
    📋 Manage Inventory
  </button>
)}

            <button
              onClick={() => setActiveTab("Reports")}
              className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
            >
              📈 View Reports
            </button>

            <button
              onClick={() => setActiveTab("Feedback")}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              ⭐ Customer Feedback
            </button>
            <button
  onClick={handleLogout}
  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
>
  🚪 Logout
</button>
          </div>
        </section>
      </div>
    );
  }

  // Food menu
  function renderFoodMenu() {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Food Menu</h2>
           <p className="mt-1 text-slate-500">
  {userRole === "ADMIN"
    ? "Manage food items and monitor availability."
    : userRole === "STAFF"
    ? "View food items and manage availability."
    : "Browse food items and add them to your cart."}
</p>
          </div>

          <div className="flex gap-2">
  {userRole === "ADMIN" && (
    <button
      onClick={() => {
        setFoodMessage("");
        setShowFoodForm(!showFoodForm);
      }}
      className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
    >
      + Add Food Item
    </button>
  )}

  <button
    onClick={fetchMenu}
    disabled={menuLoading}
    className="rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
  >
    {menuLoading ? "Loading..." : "Refresh Menu"}
  </button>
</div>
        </div>
        {userRole === "ADMIN" && showFoodForm && (
  <section className="rounded-2xl bg-white p-6 shadow-sm">
   <h3 className="text-xl font-bold">
  {editingFoodId !== null ? "Edit Food Item" : "Add New Food Item"}
</h3>
    <form
      className="mt-4 grid gap-4 sm:grid-cols-2"
onSubmit={(event) => {
  event.preventDefault();

  if (editingFoodId !== null) {
    void updateFoodItem();
  } else {
    void saveFoodItem();
  }
}}
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Food Name</label>
        <input
          value={foodName}
          onChange={(event) => setFoodName(event.target.value)}
          required
          placeholder="e.g. Masala Dosa"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Price (₹)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={foodPrice}
          onChange={(event) => setFoodPrice(event.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          value={foodCategory}
          onChange={(event) => setFoodCategory(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Snacks">Snacks</option>
          <option value="Drinks">Drinks</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <input
          value={foodDescription}
          onChange={(event) => setFoodDescription(event.target.value)}
          placeholder="Short description"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
  <div>
  <label className="mb-1 block text-sm font-medium">
    Upload New Food Photo
  </label>

  <input
    type="file"
    accept="image/png,image/jpeg,image/webp"
    onChange={(event) => {
      setFoodImage(event.target.files?.[0] || null);
      setExistingFoodImage("");
    }}
    className="w-full rounded-lg border border-slate-300 px-3 py-2"
  />

  <p className="mt-1 text-xs text-slate-500">
    JPG, PNG or WEBP. Maximum size: 5 MB.
  </p>

  <label className="mb-1 mt-3 block text-sm font-medium">
    Or Reuse an Existing Photo
  </label>

  <select
    value={existingFoodImage}
    onChange={(event) => {
      setExistingFoodImage(event.target.value);
      setFoodImage(null);
      setExistingFoodImage("");

    }}
    className="w-full rounded-lg border border-slate-300 px-3 py-2"
  >
    <option value="">Select an existing photo</option>
    <option value="/uploads/23da25a9-9d2e-409e-863e-9be34cc6bc95.jpg">
      Masala Dosa Photo
    </option>
    <option value="/uploads/711d2f81-1281-434c-9af8-6bdb33d964cd.jpg">
      Gobi Manchurian Photo
    </option>
  </select>
</div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={foodAvailable}
          onChange={(event) => setFoodAvailable(event.target.checked)}
        />
        Available for ordering
      </label>

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={foodSaving}
          className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
         {editingFoodId !== null
  ? foodUpdating
    ? "Updating..."
    : "Update Food Item"
  : foodSaving
  ? "Saving..."
  : "Save Food Item"}
        </button>

        <button
          type="button"
          onClick={() => setShowFoodForm(false)}
          className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-700"
        >
          Cancel
        </button>
      </div>

      {foodMessage && (
        <p className="sm:col-span-2 text-sm text-red-600">
          {foodMessage}
        </p>
      )}
    </form>
  </section>
)}

        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                category === item
                  ? "bg-orange-500 text-white"
                  : "bg-white text-slate-600 hover:bg-orange-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {menuLoading ? (
          <p className="rounded-xl bg-white p-6 text-slate-500">
            Loading food menu...
          </p>
        ) : menuError ? (
          <div className="rounded-xl bg-white p-6">
            <p className="text-red-600">{menuError}</p>
            <button
              onClick={fetchMenu}
              className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-slate-500">
            No food items found in this category.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.item_id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
             {item.image_url ? (
  <img
    src={item.image_url}
    alt={item.item_name}
    className="h-44 w-full rounded-xl object-cover"
    loading="lazy"
  />
) : (
  <div className="flex h-44 w-full items-center justify-center rounded-xl bg-slate-100 text-5xl">
    🍽️
  </div>
)}

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{item.item_name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.category_name}
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-lg font-bold text-orange-600">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                </div>

                <p className="mt-3 min-h-10 text-sm text-slate-500">
                  {item.description || "Freshly prepared food."}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.is_available ? "Available" : "Unavailable"}
                  </span>

                  {userRole === "CUSTOMER" && (
  <button
    onClick={() => addToCart(item.item_id)}
    disabled={!item.is_available}
    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
  >
    Add to Cart
  </button>
)}
{userRole === "ADMIN" && (
  <div className="flex gap-2">
    <button
      onClick={() => {
        setEditingFoodId(item.item_id);
        setFoodName(item.item_name);
        setFoodDescription(item.description || "");
        setFoodPrice(String(item.price));
        setFoodCategory(item.category_name);
        setFoodAvailable(item.is_available);
        setFoodMessage("");
        setShowFoodForm(true);
      }}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      Edit
    </button>

    <button
      onClick={() => deleteFoodItem(item.item_id)}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
    >
      Delete
    </button>
  </div>
)}
                </div>
              </div>
            ))}
          </div>
        )}

        {userRole === "CUSTOMER" && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Your Cart</h3>

          {cart.length === 0 ? (
            <p className="mt-4 text-slate-500">
              Your cart is empty. Add food items from the menu.
            </p>
          ) : (
            <>
              <div className="mt-4 space-y-3">
                {Object.entries(
                  cart.reduce<Record<number, number>>((counts, id) => {
                    counts[id] = (counts[id] || 0) + 1;
                    return counts;
                  }, {})
                ).map(([id, quantity]) => {
                  const item = menuItems.find(
                    (food) => food.item_id === Number(id)
                  );

                  if (!item) return null;

                  return (
                    <div
                      key={id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"
                    >
                      <div>
                        <p className="font-semibold">{item.item_name}</p>
                        <p className="text-sm text-slate-500">
                          ₹{Number(item.price).toFixed(2)} × {quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCart((current) => {
                              const index = current.indexOf(Number(id));
                              if (index === -1) return current;
                              return current.filter((_, i) => i !== index);
                            })
                          }
                          className="rounded-lg border px-3 py-1"
                        >
                          −
                        </button>

                        <span className="min-w-6 text-center font-semibold">
                          {quantity}
                        </span>

                        <button
                          onClick={() => addToCart(Number(id))}
                          className="rounded-lg border px-3 py-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xl font-bold">
                  Total: ₹{total.toFixed(2)}
                </p>

                <button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </>
          )}

          {orderMessage && (
            <p
              className={`mt-4 text-sm font-semibold ${
                orderSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {orderMessage}
            </p>
          )}
        </section>
        )}
      </div>
    );
  }

  // Orders page
  function renderOrders() {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Orders Management</h2>
            <p className="mt-1 text-slate-500">
              View all customer orders stored in PostgreSQL.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={ordersLoading}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
          >
            {ordersLoading ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          {renderOrdersTable()}
        </section>
      </div>
    );
  }

  // Inventory page
  function renderInventory() {
    const selectedItem = inventoryItems.find(
      (item) => String(item.inventory_id) === selectedInventoryId
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Inventory Management</h2>
            <p className="mt-1 text-slate-500">
              Monitor ingredients and manage stock levels.
            </p>
          </div>

          <button
            onClick={() => {
              fetchInventory();
              fetchTransactions();
            }}
            disabled={inventoryLoading || transactionsLoading}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
          >
            Refresh Inventory
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Ingredients</p>
            <h3 className="mt-2 text-3xl font-bold">
              {inventoryItems.length}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Low Stock Items</p>
            <h3 className="mt-2 text-3xl font-bold text-red-600">
              {lowStockItems.length}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Transactions</p>
            <h3 className="mt-2 text-3xl font-bold">
              {transactions.length}
            </h3>
          </div>
        </div>

        {inventoryLoading ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-500">Loading inventory...</p>
          </section>
        ) : inventoryError ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-red-600">{inventoryError}</p>
            <button
              onClick={fetchInventory}
              className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white"
            >
              Retry
            </button>
          </section>
        ) : (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Current Inventory</h3>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[750px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Ingredient</th>
                    <th className="p-4">Current Quantity</th>
                    <th className="p-4">Minimum Stock</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {inventoryItems.map((item) => {
                    const isLow =
                      Number(item.quantity) <= Number(item.minimum_stock);

                    return (
                      <tr
                        key={item.inventory_id}
                        className="border-t border-slate-200"
                      >
                        <td className="p-4 font-semibold">
                          {item.ingredient_name}
                        </td>
                        <td className="p-4">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-4">
                          {item.minimum_stock} {item.unit}
                        </td>
                        <td className="p-4">
                          {item.supplier_name || "Not assigned"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isLow
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {isLow ? "Low Stock" : "Available"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Add and remove stock forms */}
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">➕ Add Stock</h3>
            <p className="mt-1 text-sm text-slate-500">
              Record incoming ingredient stock.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Select Ingredient
                </label>
                <select
                  value={selectedInventoryId}
                  onChange={(e) => setSelectedInventoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="">Select ingredient</option>
                  {inventoryItems.map((item) => (
                    <option
                      key={item.inventory_id}
                      value={item.inventory_id}
                    >
                      {item.ingredient_name} ({item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Notes
                </label>
                <textarea
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="Optional notes"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <button
                onClick={addStock}
                disabled={stockSubmitting || inventoryItems.length === 0}
                className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {stockSubmitting ? "Adding Stock..." : "Add Stock"}
              </button>

              {stockMessage && (
                <p
                  className={`text-sm font-medium ${
                    stockSuccess ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stockMessage}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">➖ Remove Stock</h3>
            <p className="mt-1 text-sm text-slate-500">
              Record ingredient consumption or stock removal.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Select Ingredient
                </label>
                <select
                  value={selectedInventoryId}
                  onChange={(e) => setSelectedInventoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="">Select ingredient</option>
                  {inventoryItems.map((item) => (
                    <option
                      key={item.inventory_id}
                      value={item.inventory_id}
                    >
                      {item.ingredient_name} ({item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Quantity to Remove
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={removeQuantity}
                  onChange={(e) => setRemoveQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
                {selectedItem && (
                  <p className="mt-1 text-xs text-slate-500">
                    Available: {selectedItem.quantity} {selectedItem.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Notes
                </label>
                <textarea
                  value={removeNotes}
                  onChange={(e) => setRemoveNotes(e.target.value)}
                  placeholder="Optional notes"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <button
                onClick={removeStock}
                disabled={removeSubmitting || inventoryItems.length === 0}
                className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {removeSubmitting ? "Removing Stock..." : "Remove Stock"}
              </button>

              {removeMessage && (
                <p
                  className={`text-sm font-medium ${
                    removeSuccess ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {removeMessage}
                </p>
              )}
            </div>
          </section>
        </div>

        {renderTransactionHistory()}
      </div>
    );
  }  // Reports dashboard
  function renderReports() {
    if (reportsLoading) {
      return (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">Loading reports...</p>
        </section>
      );
    }

    if (reportsError || !reports) {
      return (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-red-600">
            {reportsError || "No report data available."}
          </p>
          <button
            onClick={fetchReports}
            className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white"
          >
            Retry
          </button>
        </section>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <p className="mt-1 text-slate-500">
              Business insights generated from PostgreSQL data.
            </p>
          </div>

          <button
            onClick={fetchReports}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white"
          >
            Refresh Reports
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Orders</p>
            <h3 className="mt-2 text-3xl font-bold">
              {reports.summary.total_orders}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <h3 className="mt-2 text-3xl font-bold">
              ₹{Number(reports.summary.total_revenue).toFixed(2)}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Completed Orders</p>
            <h3 className="mt-2 text-3xl font-bold text-green-600">
              {reports.summary.completed_orders}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Cancelled Orders</p>
            <h3 className="mt-2 text-3xl font-bold text-red-600">
              {reports.summary.cancelled_orders}
            </h3>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Daily Sales</h3>
            <p className="mt-1 text-sm text-slate-500">
              Daily order count and revenue.
            </p>

            {reports.dailySales.length === 0 ? (
              <p className="mt-5 text-slate-500">No sales data available.</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.dailySales.map((sale, index) => (
                      <tr key={`${sale.sale_date}-${index}`} className="border-t">
                        <td className="p-3">
                          {new Date(sale.sale_date).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-3">{sale.total_orders}</td>
                        <td className="p-3 font-semibold">
                          ₹{Number(sale.total_revenue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Popular Food Items</h3>
            <p className="mt-1 text-sm text-slate-500">
              Best-selling items based on order quantities.
            </p>

            {reports.popularItems.length === 0 ? (
              <p className="mt-5 text-slate-500">No popular items available.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {reports.popularItems.map((item, index) => (
                  <div
                    key={`${item.item_name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold">{item.item_name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Quantity sold: {item.total_quantity}
                      </p>
                    </div>
                    <p className="font-bold text-orange-600">
                      ₹{Number(item.total_revenue).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Low Stock Report</h3>
          <p className="mt-1 text-sm text-slate-500">
            Ingredients that have reached or fallen below minimum stock.
          </p>

          {reports.lowStockItems.length === 0 ? (
            <p className="mt-5 text-green-600">
              All inventory items have sufficient stock.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[550px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-3">Ingredient</th>
                    <th className="p-3">Available</th>
                    <th className="p-3">Minimum Stock</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.lowStockItems.map((item) => (
                    <tr key={item.inventory_id} className="border-t">
                      <td className="p-3 font-semibold">
                        {item.ingredient_name}
                      </td>
                      <td className="p-3">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-3">
                        {item.minimum_stock} {item.unit}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Restock Required
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  // Customer Feedback dashboard
  function renderFeedback() {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Customer Feedback</h2>
            <p className="mt-1 text-slate-500">
              Collect and review customer experiences using MongoDB.
            </p>
          </div>

         {(userRole === "ADMIN" || userRole === "STAFF") && (
  <button
    onClick={fetchFeedback}
    disabled={feedbackLoading}
    className="rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
  >
    {feedbackLoading ? "Refreshing..." : "Refresh Feedback"}
  </button>
)}
        </div>

       {/* Feedback summary: Admin and Staff only */}
{(userRole === "ADMIN" || userRole === "STAFF") && (
  <div className="grid gap-5 sm:grid-cols-2">
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Total Reviews</p>
      <h3 className="mt-2 text-3xl font-bold">{totalReviews}</h3>
      <p className="mt-2 text-sm text-blue-600">
        Customer reviews received
      </p>
    </div>

    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Average Rating</p>
      <h3 className="mt-2 text-3xl font-bold">
        {averageRating.toFixed(1)} / 5
      </h3>
      <p className="mt-2 text-xl text-yellow-500">
        {"★".repeat(Math.round(averageRating))}
        {"☆".repeat(5 - Math.round(averageRating))}
      </p>
    </div>
  </div>
)}
        {/* Feedback form */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Submit Your Feedback</h3>
          <p className="mt-1 text-sm text-slate-500">
            Share your experience with the canteen.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Food Item
              </label>
              <select
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="">Select a food item</option>
                {menuItems.map((item) => (
                  <option key={item.item_id} value={item.item_name}>
                    {item.item_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Rating
              </label>
              <select
                value={feedbackRating}
                onChange={(e) => setFeedbackRating(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="5">★★★★★ - Excellent</option>
                <option value="4">★★★★ - Very Good</option>
                <option value="3">★★★ - Good</option>
                <option value="2">★★ - Average</option>
                <option value="1">★ - Poor</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Your Comment
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Write your experience..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <button
            onClick={submitFeedback}
            disabled={feedbackSubmitting}
            className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>

          {feedbackMessage && (
            <p
              className={`mt-4 text-sm font-medium ${
                feedbackSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {feedbackMessage}
            </p>
          )}
        </section>

   {/* Customer reviews */}
{(userRole === "ADMIN" || userRole === "STAFF") && (
  <section className="rounded-2xl bg-white p-6 shadow-sm">
    <h3 className="text-xl font-bold">Customer Reviews</h3>

    <p className="mt-1 text-sm text-slate-500">
      Reviews retrieved from the MongoDB customer_feedback collection.
    </p>

    {feedbackLoading ? (
      <p className="mt-5 text-slate-500">Loading customer reviews...</p>
    ) : feedbackError ? (
      <div className="mt-5">
        <p className="text-red-600">{feedbackError}</p>
        <button
          onClick={fetchFeedback}
          className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    ) : feedbacks.length === 0 ? (
      <p className="mt-5 text-slate-500">
        No customer feedback available yet.
      </p>
    ) : (
      <div className="mt-5 space-y-4">
        {feedbacks.map((feedback) => (
          <div
            key={feedback._id}
            className="rounded-xl border border-slate-200 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="font-bold">{feedback.customer_name}</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Food: {feedback.food_item}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg text-yellow-500">
                  {"★".repeat(feedback.rating)}
                  {"☆".repeat(5 - feedback.rating)}
                </p>
                <p className="text-xs text-slate-500">
                  {feedback.rating} / 5
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-700">
              {feedback.comment}
            </p>

            {feedback.created_at && (
              <p className="mt-3 text-xs text-slate-400">
                {new Date(feedback.created_at).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
    </section>
)}

</div>
    );
  }

  // Add stock to inventory
  async function addStock() {
    if (stockSubmitting) return;

    const quantity = Number(stockQuantity);

    if (!selectedInventoryId) {
      setStockSuccess(false);
      setStockMessage("Please select an ingredient.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setStockSuccess(false);
      setStockMessage("Please enter a valid quantity.");
      return;
    }

    setStockSubmitting(true);
    setStockMessage("");
    setStockSuccess(false);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventory_id: Number(selectedInventoryId),
          quantity,
          transaction_type: "STOCK_IN",
          notes: stockNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to add stock.");
      }

      setStockSuccess(true);
      setStockMessage("Stock added successfully!");
      setStockQuantity("");
      setStockNotes("");

      await Promise.all([
        fetchInventory(),
        fetchTransactions(),
        fetchReports(),
      ]);
    } catch (error) {
      console.error("Add stock error:", error);
      setStockSuccess(false);
      setStockMessage(
        error instanceof Error ? error.message : "Unable to add stock."
      );
    } finally {
      setStockSubmitting(false);
    }
  }

  // Remove stock from inventory
  async function removeStock() {
    if (removeSubmitting) return;

    const quantity = Number(removeQuantity);

    if (!selectedInventoryId) {
      setRemoveSuccess(false);
      setRemoveMessage("Please select an ingredient.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setRemoveSuccess(false);
      setRemoveMessage("Please enter a valid quantity.");
      return;
    }

    const selectedItem = inventoryItems.find(
      (item) => item.inventory_id === Number(selectedInventoryId)
    );

    if (selectedItem && quantity > Number(selectedItem.quantity)) {
      setRemoveSuccess(false);
      setRemoveMessage("Insufficient stock available.");
      return;
    }

    setRemoveSubmitting(true);
    setRemoveMessage("");
    setRemoveSuccess(false);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventory_id: Number(selectedInventoryId),
          quantity,
          transaction_type: "STOCK_OUT",
          notes: removeNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to remove stock.");
      }

      setRemoveSuccess(true);
      setRemoveMessage("Stock removed successfully!");
      setRemoveQuantity("");
      setRemoveNotes("");

      await Promise.all([
        fetchInventory(),
        fetchTransactions(),
        fetchReports(),
      ]);
    } catch (error) {
      console.error("Remove stock error:", error);
      setRemoveSuccess(false);
      setRemoveMessage(
        error instanceof Error ? error.message : "Unable to remove stock."
      );
    } finally {
      setRemoveSubmitting(false);
    }
  }

  // Orders table
  function renderOrdersTable() {
    if (ordersLoading) {
      return (
        <p className="mt-5 text-slate-500">Loading orders...</p>
      );
    }

    if (ordersError) {
      return (
        <div className="mt-5">
          <p className="text-red-600">{ordersError}</p>
          <button
            onClick={fetchOrders}
            className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <p className="mt-5 text-slate-500">No orders found.</p>
      );
    }

    return (
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Items</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id} className="border-t border-slate-200">
                <td className="p-3 font-semibold">
                  #{order.order_id}
                </td>

                <td className="p-3">
                  {order.customer_name || "Customer"}
                </td>

                <td className="p-3">
                  {new Date(order.order_date).toLocaleDateString("en-IN")}
                </td>

                <td className="p-3">
                  {order.items?.map((item, index) => (
                    <span key={`${item.item_name}-${index}`}>
                      {item.item_name} × {item.quantity}
                      {index < order.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </td>

                <td className="p-3 font-semibold">
                  ₹{Number(order.total_amount).toFixed(2)}
                </td>

                <td className="p-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.order_status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : order.order_status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : order.order_status === "READY"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.order_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Inventory transaction history
  function renderTransactionHistory() {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">
              Inventory Transaction History
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Track all stock additions and removals.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            disabled={transactionsLoading}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
          >
            Refresh History
          </button>
        </div>

        {transactionsLoading ? (
          <p className="mt-5 text-slate-500">
            Loading transaction history...
          </p>
        ) : transactionsError ? (
          <div className="mt-5">
            <p className="text-red-600">{transactionsError}</p>
            <button
              onClick={fetchTransactions}
              className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <p className="mt-5 text-slate-500">
            No inventory transactions found.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Ingredient</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.transaction_id}
                    className="border-t border-slate-200"
                  >
                    <td className="p-3 font-semibold">
                      #{transaction.transaction_id}
                    </td>

                    <td className="p-3">
                      {transaction.ingredient_name}
                    </td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.transaction_type === "STOCK_IN"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>

                    <td className="p-3">
                      {transaction.quantity} {transaction.unit}
                    </td>

                    <td className="p-3">
                      {new Date(
                        transaction.transaction_date
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-3">
                      {transaction.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  // Sidebar navigation
  const navItems = [
    { name: "Overview", icon: "📊" },
    { name: "Food Menu", icon: "🍽️" },
    { name: "Orders", icon: "📦" },
    { name: "Inventory", icon: "📋" },
    { name: "Reports", icon: "📈" },
    { name: "Feedback", icon: "⭐" },
  ];

  // Main application layout
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col md:flex-row">

        {/* Sidebar */}
        <aside className="w-full bg-slate-900 text-white md:min-h-screen md:w-64 md:flex-shrink-0">
          <div className="border-b border-slate-700 px-6 py-6">
            <h1 className="text-xl font-bold">
              🍴 Smart Canteen
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Management System
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto p-3 md:flex-col md:overflow-visible">
           {navItems
  .filter((item) => {
    if (userRole === "ADMIN") return true;

    if (userRole === "STAFF") {
      return [
        "Overview",
        "Food Menu",
        "Orders",
        "Reports",
        "Feedback",
      ].includes(item.name);
    }

    if (userRole === "CUSTOMER") {
      return [
        "Overview",
        "Food Menu",
        "Orders",
        "Feedback",
      ].includes(item.name);
    }

    return false;
  })
  .map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeTab === item.name
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="hidden border-t border-slate-700 px-6 py-5 md:block">
            <p className="text-xs text-slate-400">
              Database Management Project
            </p>
            <p className="mt-1 text-sm font-semibold">
              PostgreSQL + MongoDB
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-5 md:px-8">
            <div>
              <h2 className="text-xl font-bold">
                {activeTab}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Smart Canteen Management System
              </p>
            </div>
            <div className="flex items-center gap-3">
  <span className="rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-700">
    System Active
  </span>

  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
    A
  </div>
</div>

          </header>

          <div className="p-5 md:p-8">
            {activeTab === "Overview" && renderOverview()}
            {activeTab === "Food Menu" && renderFoodMenu()}
            {activeTab === "Orders" && renderOrders()}
            {activeTab === "Inventory" && renderInventory()}
            {activeTab === "Reports" && renderReports()}
            {activeTab === "Feedback" && renderFeedback()}
          </div>

          <footer className="border-t border-slate-200 bg-white px-5 py-4 text-center text-xs text-slate-500">
            Smart Canteen Management System | Database Management Project
          </footer>
        </main>
      </div>
    </div>
  );
}