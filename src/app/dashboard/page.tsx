"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

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

type Category = {
  category_id: number;
  category_name: string;
  description: string | null;
};

type Order = {
  order_id: number;
  customer_name: string;
  order_date: string;
  total_amount: string | number;
  order_status: string;
  payment_method: "CASH" | "UPI" | "CARD" | null;
  payment_status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | null;
  payment_date: string | null;
  items: {
    item_name: string;
    quantity: number;
  }[];
};

type Payment = {
  payment_id: number;
  order_id: number;
  amount: string | number;
  payment_method: "CASH" | "UPI" | "CARD";
  payment_status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  payment_date: string;
  order_status: string;
  customer_name: string | null;
};

type OrderActivity = {
  status: string;
  description: string;
  activity_date: string;
};

const nextOrderStatuses: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
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

type Supplier = {
  supplier_id: number;
  supplier_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
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

type AdminDashboardStats = {
  today_orders: number;
  today_revenue: string | number;
  total_menu_items: number;
  low_stock_items: number;
};

type CustomerDashboardStats = {
  total_orders: number;
  total_spending: string | number;
  completed_orders: number;
  available_menu_items: number;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryMessage, setCategoryMessage] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [paymentSummary, setPaymentSummary] = useState<{
    total_revenue: string | number;
    successful_payments: number;
    pending_payments: number;
    failed_payments: number;
  } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH");
  const [simulationOutcome, setSimulationOutcome] = useState<"SUCCESS" | "FAILED">("SUCCESS");
  const [orderUpdatingId, setOrderUpdatingId] = useState<number | null>(null);
  const [orderUpdateMessage, setOrderUpdateMessage] = useState("");
  const [orderUpdateSuccess, setOrderUpdateSuccess] = useState(false);
  const [orderActivity, setOrderActivity] = useState<{ orderId: number; entries: OrderActivity[] } | null>(null);
  const [orderActivityLoading, setOrderActivityLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | CustomerDashboardStats | null>(null);
  const [dashboardStatsLoading, setDashboardStatsLoading] = useState(true);
  const [dashboardStatsError, setDashboardStatsError] = useState("");

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [suppliersError, setSuppliersError] = useState("");
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [inventoryName, setInventoryName] = useState("");
  const [inventoryUnit, setInventoryUnit] = useState("");
  const [inventoryInitialQuantity, setInventoryInitialQuantity] = useState("0");
  const [inventoryMinimumStock, setInventoryMinimumStock] = useState("5");
  const [inventorySupplierId, setInventorySupplierId] = useState("");
  const [inventoryCreateMessage, setInventoryCreateMessage] = useState("");
  const [inventoryCreating, setInventoryCreating] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [supplierMessage, setSupplierMessage] = useState("");
  const [supplierSubmitting, setSupplierSubmitting] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);

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

  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load categories.");
      }
      setCategories(data.categories);
      setFoodCategory((current) =>
        data.categories.some((item: Category) => item.category_name === current)
          ? current
          : data.categories[0]?.category_name || ""
      );
    } catch (error) {
      console.error("Category loading error:", error);
      setCategoryMessage("Unable to load categories. Please try again.");
    }
  }

  async function saveCategory() {
    if (categorySubmitting) return;
    setCategorySubmitting(true);
    setCategoryMessage("");
    try {
      const response = await fetch("/api/categories", {
        method: editingCategoryId === null ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingCategoryId === null ? {} : { category_id: editingCategoryId }),
          category_name: categoryName,
          description: categoryDescription,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to save category.");
      setCategoryMessage(data.message);
      setCategoryName("");
      setCategoryDescription("");
      setEditingCategoryId(null);
      await Promise.all([fetchCategories(), fetchMenu()]);
    } catch (error) {
      setCategoryMessage(error instanceof Error ? error.message : "Unable to save category.");
    } finally {
      setCategorySubmitting(false);
    }
  }

  async function deleteCategory(categoryId: number, name: string) {
    if (!window.confirm(`Delete the “${name}” category? Categories used by menu items cannot be removed.`)) return;
    try {
      const response = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to delete category.");
      setCategoryMessage(data.message);
      await Promise.all([fetchCategories(), fetchMenu()]);
    } catch (error) {
      setCategoryMessage(error instanceof Error ? error.message : "Unable to delete category.");
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
        category_id: categories.find((item) => item.category_name === foodCategory)?.category_id,
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
    setFoodCategory(categories[0]?.category_name || "");
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
        category_id: categories.find((item) => item.category_name === foodCategory)?.category_id,
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

  async function fetchPayments(roleOverride = userRole) {
    try {
      setPaymentsLoading(true);
      setPaymentsError("");
      const query = new URLSearchParams();
      if (roleOverride === "ADMIN" && paymentStatusFilter) query.set("status", paymentStatusFilter);
      if (roleOverride === "ADMIN" && paymentMethodFilter) query.set("method", paymentMethodFilter);
      const response = await fetch(`/api/payments${query.size ? `?${query.toString()}` : ""}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load payment history.");
      setPayments(data.payments || []);
      setPaymentSummary(data.summary || null);
    } catch (error) {
      setPaymentsError(error instanceof Error ? error.message : "Unable to load payment history.");
    } finally {
      setPaymentsLoading(false);
    }
  }

  async function showPaymentDetails(paymentId: number) {
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load payment details.");
      setSelectedPayment(data.payment);
    } catch (error) {
      setPaymentsError(error instanceof Error ? error.message : "Unable to load payment details.");
    }
  }

  async function markCashCollected(paymentId: number) {
    try {
      const response = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to record cash collection.");
      await Promise.all([fetchPayments(), fetchOrders()]);
    } catch (error) {
      setPaymentsError(error instanceof Error ? error.message : "Unable to record cash collection.");
    }
  }

  async function retryFailedPayment(orderId: number) {
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, payment_method: "UPI", simulation_outcome: "SUCCESS" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to retry simulated payment.");
      await Promise.all([fetchPayments(), fetchOrders(), fetchDashboardStats()]);
    } catch (error) {
      setPaymentsError(error instanceof Error ? error.message : "Unable to retry simulated payment.");
    }
  }

  async function fetchDashboardStats() {
    try {
      setDashboardStatsLoading(true);
      setDashboardStatsError("");
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load dashboard statistics.");
      }
      setDashboardStats(data.stats);
    } catch (error) {
      setDashboardStatsError(error instanceof Error ? error.message : "Unable to load dashboard statistics.");
    } finally {
      setDashboardStatsLoading(false);
    }
  }

  async function updateOrderStatus(orderId: number, orderStatus: string) {
    setOrderUpdatingId(orderId);
    setOrderUpdateMessage("");
    setOrderUpdateSuccess(false);
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, order_status: orderStatus }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to update order status.");
      setOrderUpdateSuccess(true);
      setOrderUpdateMessage(`Order #${orderId} moved to ${orderStatus}.`);
      await fetchOrders();
    } catch (error) {
      setOrderUpdateMessage(error instanceof Error ? error.message : "Unable to update order status.");
    } finally {
      setOrderUpdatingId(null);
    }
  }

  async function viewOrderActivity(orderId: number) {
    setOrderActivityLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/activity`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load order activity.");
      setOrderActivity({ orderId, entries: data.activities || [] });
    } catch (error) {
      setOrderUpdateMessage(error instanceof Error ? error.message : "Unable to load order activity.");
      setOrderUpdateSuccess(false);
    } finally {
      setOrderActivityLoading(false);
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

  async function fetchSuppliers() {
    try {
      setSuppliersLoading(true);
      setSuppliersError("");
      const response = await fetch("/api/suppliers");
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load suppliers.");
      setSuppliers(data.suppliers);
    } catch (error) {
      console.error("Supplier loading error:", error);
      setSuppliersError("Unable to load suppliers. Please try again.");
    } finally {
      setSuppliersLoading(false);
    }
  }

  async function saveSupplier() {
    if (supplierSubmitting) return;
    setSupplierSubmitting(true);
    setSupplierMessage("");
    try {
      const response = await fetch("/api/suppliers", {
        method: editingSupplierId === null ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingSupplierId === null ? {} : { supplier_id: editingSupplierId }),
          supplier_name: supplierName,
          contact_person: supplierContact,
          phone: supplierPhone,
          email: supplierEmail,
          address: supplierAddress,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to save supplier.");
      setSupplierMessage(data.message);
      setSupplierName("");
      setSupplierContact("");
      setSupplierPhone("");
      setSupplierEmail("");
      setSupplierAddress("");
      setEditingSupplierId(null);
      await fetchSuppliers();
      await fetchInventory();
    } catch (error) {
      setSupplierMessage(error instanceof Error ? error.message : "Unable to save supplier.");
    } finally {
      setSupplierSubmitting(false);
    }
  }

  async function deleteSupplier(supplierId: number, name: string) {
    if (!window.confirm(`Delete supplier “${name}”? Suppliers linked to inventory cannot be removed.`)) return;
    try {
      const response = await fetch("/api/suppliers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: supplierId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to delete supplier.");
      setSupplierMessage(data.message);
      await fetchSuppliers();
    } catch (error) {
      setSupplierMessage(error instanceof Error ? error.message : "Unable to delete supplier.");
    }
  }

  async function createInventoryItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inventoryCreating) return;
    setInventoryCreating(true);
    setInventoryCreateMessage("");
    try {
      const response = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient_name: inventoryName,
          unit: inventoryUnit,
          quantity: inventoryInitialQuantity,
          minimum_stock: inventoryMinimumStock,
          supplier_id: inventorySupplierId || null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to create inventory item.");
      setInventoryCreateMessage(data.message);
      setInventoryName("");
      setInventoryUnit("");
      setInventoryInitialQuantity("0");
      setInventoryMinimumStock("5");
      setInventorySupplierId("");
      setSelectedInventoryId(String(data.inventory.inventory_id));
      setShowInventoryForm(false);
      await Promise.all([fetchInventory(), fetchTransactions(), fetchReports()]);
    } catch (error) {
      setInventoryCreateMessage(error instanceof Error ? error.message : "Unable to create inventory item.");
    } finally {
      setInventoryCreating(false);
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

    await fetchFeedback();

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
        fetchCategories(),
        fetchOrders(),
        ...(role === "ADMIN" || role === "CUSTOMER" ? [fetchDashboardStats()] : []),
      ]);
      if (role === "STAFF") setDashboardStatsLoading(false);

      if (role === "ADMIN") {
        await Promise.all([
          fetchInventory(),
          fetchTransactions(),
          fetchSuppliers(),
        ]);
      } else {
        setInventoryLoading(false);
        setTransactionsLoading(false);
        setSuppliersLoading(false);
      }

      if (role === "ADMIN" || role === "CUSTOMER") {
        await fetchPayments(role);
      } else {
        setPaymentsLoading(false);
      }

      if (role === "ADMIN" || role === "STAFF" || role === "CUSTOMER") {
        await Promise.all([
          ...(role === "ADMIN" || role === "STAFF" ? [fetchReports()] : []),
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

useEffect(() => {
  if (userRole === "ADMIN") void fetchPayments("ADMIN");
}, [userRole, paymentStatusFilter, paymentMethodFilter]);
  // Filter menu by category
  const filteredItems =
    category === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category_name === category
        );
  const categoryFilters = ["All", ...categories.map((item) => item.category_name)];

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

      setCart([]);
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: data.order_id,
          payment_method: paymentMethod,
          ...(paymentMethod === "UPI" ? { simulation_outcome: simulationOutcome } : {}),
        }),
      });
      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok || !paymentData.success) {
        setOrderSuccess(false);
        setOrderMessage(`Order #${data.order_id} was placed, but payment was not recorded: ${paymentData.message || "Please check My Payments."}`);
      } else if (paymentData.payment.payment_status === "FAILED") {
        setOrderSuccess(false);
        setOrderMessage(`Order #${data.order_id} was placed. Simulated payment failed; no real money was charged. You can retry from My Payments.`);
      } else {
        setOrderSuccess(true);
        setOrderMessage(paymentData.message);
      }
      await Promise.all([
        fetchOrders(),
        fetchPayments("CUSTOMER"),
        fetchDashboardStats(),
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
  // Identify low-stock ingredients
  const lowStockItems: InventoryItem[] = inventoryItems.filter(
    (item: InventoryItem) =>
      Number(item.quantity) <= Number(item.minimum_stock)
  );
    // Overview
   
 
function renderOverview() {
  const customerStats = userRole === "CUSTOMER"
    ? dashboardStats as CustomerDashboardStats | null
    : null;
  const adminStats = userRole === "ADMIN"
    ? dashboardStats as AdminDashboardStats | null
    : null;
  const visibleMenuCount = userRole === "CUSTOMER"
    ? customerStats?.available_menu_items
    : adminStats?.total_menu_items ?? menuItems.length;

  return (
    <div className="space-y-7">

      {/* Welcome */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-[#9B7A43]">
          CANTEEN DASHBOARD
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, {currentUser?.full_name?.split(" ")[0] || "User"}!
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {userRole === "CUSTOMER" ? "Your orders, spending and menu at a glance." : "Here's what's happening in your canteen today."}
        </p>
      </section>

      {/* Statistics */}
      {dashboardStatsError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{dashboardStatsError}</p>}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {(userRole === "ADMIN"
          ? [
              { label: "Today's Orders", value: adminStats?.today_orders, detail: "Orders from all customers", icon: "📦" },
              { label: "Today's Revenue", value: adminStats ? `₹${Number(adminStats.today_revenue).toFixed(2)}` : undefined, detail: "Excludes cancelled orders", icon: "◈" },
              { label: "Total Menu Items", value: adminStats?.total_menu_items, detail: "Items across the menu", icon: "🍽️" },
              { label: "Inventory Status", value: adminStats?.low_stock_items, detail: "Items at or below minimum stock", icon: "⚠️" },
            ]
          : userRole === "CUSTOMER"
            ? [
                { label: "My Total Orders", value: customerStats?.total_orders, detail: "All orders on your account", icon: "📦" },
                { label: "My Total Spending", value: customerStats ? `₹${Number(customerStats.total_spending).toFixed(2)}` : undefined, detail: "Completed orders only", icon: "◈" },
                { label: "Available Menu Items", value: visibleMenuCount, detail: "Currently available to order", icon: "🍽️" },
                { label: "My Completed Orders", value: customerStats?.completed_orders, detail: "Orders completed", icon: "✓" },
              ]
            : [
                { label: "Orders", value: orders.length, detail: "Orders available to staff", icon: "📦" },
                { label: "Menu Items", value: menuItems.length, detail: "Items across the menu", icon: "🍽️" },
              ]
        ).map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <span aria-hidden="true" className="rounded-xl bg-[#F8F3E8] p-3 text-xl text-[#9B7A43]">{stat.icon}</span>
            </div>
            <h3 className="mt-5 text-3xl font-bold text-slate-900">
              {dashboardStatsLoading && userRole !== "STAFF" ? "…" : stat.value ?? "—"}
            </h3>
            <p className="mt-2 text-xs text-slate-400">{stat.detail}</p>
          </div>
        ))}
      </section>

      {/* Recent Orders */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{userRole === "CUSTOMER" ? "My Recent Orders" : "Recent Orders"}</h3>
            <p className="mt-1 text-xs text-slate-400">{userRole === "CUSTOMER" ? "Your latest orders" : "Latest customer orders"}</p>
          </div>
          <button
            onClick={() => setActiveTab("Orders")}
            className="rounded-xl bg-[#F8F3E8] px-4 py-2 text-sm font-semibold text-[#9B7A43] hover:bg-[#F2E8D2]"
          >
            View All →
          </button>
        </div>
        <div className="overflow-x-auto p-4">
          {renderOrdersTable()}
        </div>
      </section>

      {(userRole === "ADMIN" || userRole === "CUSTOMER") && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{userRole === "CUSTOMER" ? "My Payment History" : "Payment Summary"}</h3>
              <p className="mt-1 text-xs text-slate-400">{userRole === "CUSTOMER" ? "Your latest payment records" : "Revenue includes successful, non-cancelled payments only"}</p>
            </div>
            <button onClick={() => setActiveTab("Payments")} className="rounded-xl bg-[#F8F3E8] px-4 py-2 text-sm font-semibold text-[#9B7A43]">{userRole === "CUSTOMER" ? "View My Payments →" : "Manage Payments →"}</button>
          </div>
          {userRole === "ADMIN" ? (
            paymentSummary ? <div className="mt-4 grid gap-3 sm:grid-cols-3"><p className="rounded-xl bg-[#FAF8F2] p-4 text-sm text-slate-600">Paid revenue <strong className="block text-xl text-slate-900">₹{Number(paymentSummary.total_revenue).toFixed(2)}</strong></p><p className="rounded-xl bg-[#FAF8F2] p-4 text-sm text-slate-600">Successful payments <strong className="block text-xl text-slate-900">{paymentSummary.successful_payments}</strong></p><p className="rounded-xl bg-[#FAF8F2] p-4 text-sm text-slate-600">Pending payments <strong className="block text-xl text-slate-900">{paymentSummary.pending_payments}</strong></p></div> : <p className="mt-4 text-sm text-slate-500">Payment summary is loading…</p>
          ) : paymentsLoading ? <p className="mt-4 text-sm text-slate-500">Loading your payment history…</p> : payments.slice(0, 3).length ? <div className="mt-4 divide-y divide-slate-100">{payments.slice(0, 3).map((payment) => <div key={payment.payment_id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>Order #{payment.order_id} · {payment.payment_method === "CASH" ? "Cash on Delivery" : `${payment.payment_method} demo`}</span><span className="font-semibold">₹{Number(payment.amount).toFixed(2)} · {payment.payment_status}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-500">You have no payment records yet.</p>}
        </section>
      )}

      {/* Low Stock Alerts */}
      {userRole === "ADMIN" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Low Stock Alerts</h3>
              <p className="mt-1 text-xs text-slate-400">
                Inventory requiring attention
              </p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
              {lowStockItems.length} Alerts
            </span>
          </div>

          {inventoryLoading ? (
            <p className="mt-5 text-sm text-slate-500">Loading inventory...</p>
          ) : inventoryError ? (
            <p className="mt-5 text-sm text-red-600">{inventoryError}</p>
          ) : lowStockItems.length === 0 ? (
            <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              ✓ All inventory items have sufficient stock.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {lowStockItems.slice(0, 4).map((item) => (
                <div
                  key={item.inventory_id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.ingredient_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Minimum: {item.minimum_stock} {item.unit}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-red-600">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setActiveTab("Inventory")}
            className="mt-5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Manage Inventory →
          </button>
        </section>
      )}

      {/* Quick Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
        <p className="mt-1 text-sm text-slate-400">
          Access your frequently used sections.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {[
            { name: "Food Menu", description: "Browse food items", icon: "🍽️" },
            { name: "Orders", description: "View customer orders", icon: "📦" },
            ...(userRole === "ADMIN"
              ? [{ name: "Inventory", description: "Manage stock levels", icon: "📋" }]
              : []),
            ...(userRole === "ADMIN" || userRole === "STAFF"
              ? [{ name: "Reports", description: "View business reports", icon: "📈" }]
              : []),
            { name: "Feedback", description: "Customer reviews", icon: "⭐" },
            { name: "My Profile", description: "Account information", icon: "👤" },
          ].map((action) => (
            <button
              key={action.name}
              onClick={() => setActiveTab(action.name)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-[#C2A36B] hover:bg-[#F8F3E8]"
            >
              <span className="text-2xl">{action.icon}</span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  {action.name}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  {action.description}
                </span>
              </span>
            </button>
          ))}
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
      className="rounded-lg bg-[#C2A36B] px-4 py-2 font-semibold text-white hover:bg-[#9B7A43]"
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
          {categories.map((item) => (
            <option key={item.category_id} value={item.category_name}>
              {item.category_name}
            </option>
          ))}
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
          className="rounded-lg bg-[#C2A36B] px-4 py-2 font-semibold text-white hover:bg-[#9B7A43] disabled:opacity-50"
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
          {categoryFilters.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                category === item
                  ? "bg-[#C2A36B] text-white"
                  : "bg-white text-slate-600 hover:bg-[#F8F3E8]"
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
              className="mt-3 rounded-lg bg-[#C2A36B] px-4 py-2 text-white"
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

                  <span className="whitespace-nowrap text-lg font-bold text-[#9B7A43]">
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
    className="rounded-lg bg-[#C2A36B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9B7A43] disabled:cursor-not-allowed disabled:bg-slate-300"
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

              <div className="mt-5 grid gap-4 rounded-xl border border-[#E9DFC9] bg-[#FAF8F2] p-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-payment-method" className="mb-2 block text-sm font-semibold">Payment method</label>
                  <select id="checkout-payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "CASH" | "UPI")} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                    <option value="CASH">Cash on Delivery</option>
                    <option value="UPI">Simulated online payment (demo)</option>
                  </select>
                </div>
                {paymentMethod === "UPI" && (
                  <div>
                    <label htmlFor="simulation-outcome" className="mb-2 block text-sm font-semibold">Demo simulation result</label>
                    <select id="simulation-outcome" value={simulationOutcome} onChange={(event) => setSimulationOutcome(event.target.value as "SUCCESS" | "FAILED")} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                      <option value="SUCCESS">Simulate approved payment</option>
                      <option value="FAILED">Simulate declined payment</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-500">Demo only. No real payment gateway or money is used.</p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xl font-bold">
                  Total: ₹{total.toFixed(2)}
                </p>

                <button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  className="rounded-xl bg-[#C2A36B] px-6 py-3 font-semibold text-white hover:bg-[#9B7A43] disabled:opacity-50"
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </>
          )}

          {orderMessage && (
            <p
              className={`mt-4 text-sm font-semibold ${
                orderSuccess ? "text-green-700" : "text-red-600"
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

  function renderCategories() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Menu Categories</h2>
          <p className="mt-1 text-slate-500">Organize the menu while preserving category links used by food items.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(280px,.75fr)_minmax(0,1.25fr)]">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">{editingCategoryId === null ? "Add category" : "Edit category"}</h3>
            <form className="mt-4 space-y-4" onSubmit={(event) => { event.preventDefault(); void saveCategory(); }}>
              <div>
                <label htmlFor="category-name" className="mb-1 block text-sm font-semibold">Category name</label>
                <input id="category-name" value={categoryName} maxLength={50} onChange={(event) => setCategoryName(event.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label htmlFor="category-description" className="mb-1 block text-sm font-semibold">Description</label>
                <textarea id="category-description" value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={categorySubmitting} className="rounded-lg bg-[#C2A36B] px-4 py-2 font-semibold text-[#0B211C] disabled:opacity-50">{categorySubmitting ? "Saving…" : editingCategoryId === null ? "Add category" : "Save changes"}</button>
                {editingCategoryId !== null && <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryName(""); setCategoryDescription(""); }} className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-700">Cancel edit</button>}
              </div>
              {categoryMessage && <p role="status" className="text-sm text-slate-600">{categoryMessage}</p>}
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Categories</h3>
            {categories.length === 0 ? <p className="mt-4 text-sm text-slate-500">No categories found.</p> : (
              <div className="mt-4 divide-y divide-slate-100">
                {categories.map((item) => (
                  <div key={item.category_id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
                    <div className="min-w-0">
                      <p className="font-semibold">{item.category_name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.description || "No description"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingCategoryId(item.category_id); setCategoryName(item.category_name); setCategoryDescription(item.description || ""); setCategoryMessage(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:border-[#C2A36B]">Edit</button>
                      <button type="button" onClick={() => void deleteCategory(item.category_id, item.category_name)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
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
          {orderUpdateMessage && (
            <p role={orderUpdateSuccess ? "status" : "alert"} className={`mb-4 text-sm font-medium ${orderUpdateSuccess ? "text-emerald-700" : "text-red-700"}`}>
              {orderUpdateMessage}
            </p>
          )}
          {renderOrdersTable()}
        </section>
        {orderActivity && (
          <section className="rounded-2xl border border-[#E9DFC9] bg-white p-5">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold">Order #{orderActivity.orderId} activity</h3><button onClick={() => setOrderActivity(null)} className="text-sm font-semibold text-[#806333]">Close</button></div>
            {orderActivityLoading ? <p className="mt-4 text-sm text-slate-500">Loading activity…</p> : orderActivity.entries.length === 0 ? <p className="mt-4 text-sm text-slate-500">No activity has been recorded yet.</p> : (
              <ol className="mt-4 space-y-3">{orderActivity.entries.map((entry, index) => <li key={`${entry.activity_date}-${index}`} className="border-l-2 border-[#C2A36B] pl-4"><p className="font-semibold">{entry.status}</p><p className="text-sm text-slate-600">{entry.description}</p><p className="mt-1 text-xs text-slate-400">{new Date(entry.activity_date).toLocaleString("en-IN")}</p></li>)}</ol>
            )}
          </section>
        )}
      </div>
    );
  }

  function renderSuppliers() {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Suppliers</h3>
            <p className="mt-1 text-sm text-slate-500">Manage supplier contacts linked to inventory.</p>
          </div>
          <button type="button" onClick={() => { setEditingSupplierId(null); setSupplierName(""); setSupplierContact(""); setSupplierPhone(""); setSupplierEmail(""); setSupplierAddress(""); setSupplierMessage(""); }} className="rounded-lg bg-[#C2A36B] px-4 py-2 text-sm font-semibold text-[#0B211C]">New supplier</button>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); void saveSupplier(); }} className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div><label htmlFor="supplier-name" className="mb-1 block text-sm font-semibold">Supplier name</label><input id="supplier-name" value={supplierName} maxLength={100} onChange={(event) => setSupplierName(event.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
          <div><label htmlFor="supplier-contact" className="mb-1 block text-sm font-semibold">Contact person</label><input id="supplier-contact" value={supplierContact} maxLength={100} onChange={(event) => setSupplierContact(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
          <div><label htmlFor="supplier-phone" className="mb-1 block text-sm font-semibold">Phone</label><input id="supplier-phone" type="tel" value={supplierPhone} maxLength={15} onChange={(event) => setSupplierPhone(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
          <div><label htmlFor="supplier-email" className="mb-1 block text-sm font-semibold">Email</label><input id="supplier-email" type="email" value={supplierEmail} maxLength={150} onChange={(event) => setSupplierEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
          <div><label htmlFor="supplier-address" className="mb-1 block text-sm font-semibold">Address</label><input id="supplier-address" value={supplierAddress} onChange={(event) => setSupplierAddress(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
          <div className="flex items-end"><button type="submit" disabled={supplierSubmitting} className="w-full rounded-lg bg-[#062C24] px-4 py-2 font-semibold text-white disabled:opacity-50">{supplierSubmitting ? "Saving…" : editingSupplierId === null ? "Add supplier" : "Save supplier"}</button></div>
        </form>
        {supplierMessage && <p role="status" className="mt-3 text-sm text-slate-600">{supplierMessage}</p>}

        {suppliersLoading ? <p className="mt-5 text-sm text-slate-500">Loading suppliers…</p> : suppliersError ? (
          <div className="mt-4"><p role="alert" className="text-sm text-red-700">{suppliersError}</p><button type="button" onClick={() => void fetchSuppliers()} className="mt-2 rounded-lg border px-3 py-2 text-sm">Retry</button></div>
        ) : suppliers.length === 0 ? <p className="mt-5 text-sm text-slate-500">No suppliers have been added.</p> : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Supplier</th><th className="p-3">Contact</th><th className="p-3">Phone</th><th className="p-3">Email</th><th className="p-3">Actions</th></tr></thead>
              <tbody>{suppliers.map((supplier) => (
                <tr key={supplier.supplier_id} className="border-t border-slate-100">
                  <td className="p-3"><span className="font-semibold">{supplier.supplier_name}</span>{supplier.address && <span className="mt-1 block text-xs text-slate-500">{supplier.address}</span>}</td>
                  <td className="p-3">{supplier.contact_person || "—"}</td><td className="p-3">{supplier.phone || "—"}</td><td className="p-3">{supplier.email || "—"}</td>
                  <td className="p-3"><div className="flex gap-2"><button type="button" onClick={() => { setEditingSupplierId(supplier.supplier_id); setSupplierName(supplier.supplier_name); setSupplierContact(supplier.contact_person || ""); setSupplierPhone(supplier.phone || ""); setSupplierEmail(supplier.email || ""); setSupplierAddress(supplier.address || ""); setSupplierMessage(""); }} className="rounded-md border px-2.5 py-1.5 text-xs font-semibold">Edit</button><button type="button" onClick={() => void deleteSupplier(supplier.supplier_id, supplier.supplier_name)} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700">Delete</button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
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

          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setShowInventoryForm((current) => !current); setInventoryCreateMessage(""); }} className="rounded-lg bg-[#C2A36B] px-4 py-2 font-semibold text-[#0B211C]">
              {showInventoryForm ? "Close item form" : "+ Add inventory item"}
            </button>
            <button onClick={() => { setShowSupplierForm((current) => !current); setSupplierMessage(""); }} className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700">
              {showSupplierForm ? "Close suppliers" : "Manage suppliers"}
            </button>
            <button
              onClick={() => { void Promise.all([fetchInventory(), fetchTransactions(), fetchSuppliers()]); }}
              disabled={inventoryLoading || transactionsLoading}
              className="rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
            >
              Refresh inventory
            </button>
          </div>
        </div>

        {showInventoryForm && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Add inventory item</h3>
            <p className="mt-1 text-sm text-slate-500">Opening stock is recorded in the inventory transaction history.</p>
            <form onSubmit={createInventoryItem} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div><label htmlFor="ingredient-name" className="mb-1 block text-sm font-semibold">Ingredient name</label><input id="ingredient-name" value={inventoryName} maxLength={100} onChange={(event) => setInventoryName(event.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div><label htmlFor="ingredient-unit" className="mb-1 block text-sm font-semibold">Unit</label><input id="ingredient-unit" value={inventoryUnit} maxLength={20} onChange={(event) => setInventoryUnit(event.target.value)} required placeholder="kg, litre, pcs" className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div><label htmlFor="ingredient-opening-stock" className="mb-1 block text-sm font-semibold">Opening stock</label><input id="ingredient-opening-stock" type="number" min="0" max="99999999.99" step="0.01" value={inventoryInitialQuantity} onChange={(event) => setInventoryInitialQuantity(event.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div><label htmlFor="ingredient-minimum-stock" className="mb-1 block text-sm font-semibold">Low-stock threshold</label><input id="ingredient-minimum-stock" type="number" min="0" max="99999999.99" step="0.01" value={inventoryMinimumStock} onChange={(event) => setInventoryMinimumStock(event.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2" /></div>
              <div><label htmlFor="ingredient-supplier" className="mb-1 block text-sm font-semibold">Supplier (optional)</label><select id="ingredient-supplier" value={inventorySupplierId} onChange={(event) => setInventorySupplierId(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">No supplier assigned</option>{suppliers.map((supplier) => <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.supplier_name}</option>)}</select></div>
              <div className="flex items-end"><button type="submit" disabled={inventoryCreating} className="w-full rounded-lg bg-[#C2A36B] px-4 py-2 font-semibold text-[#0B211C] disabled:opacity-50">{inventoryCreating ? "Creating…" : "Create inventory item"}</button></div>
              {inventoryCreateMessage && <p role="status" className="text-sm text-slate-600 sm:col-span-2 xl:col-span-3">{inventoryCreateMessage}</p>}
            </form>
          </section>
        )}

        {showSupplierForm && renderSuppliers()}

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
              className="mt-3 rounded-lg bg-[#C2A36B] px-4 py-2 text-white"
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
            className="mt-3 rounded-lg bg-[#C2A36B] px-4 py-2 text-white"
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
                    <p className="font-bold text-[#9B7A43]">
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C2A36B]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Food Item
              </label>
              <select
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#C2A36B]"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#C2A36B]"
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C2A36B]"
              />
            </div>
          </div>

          <button
            onClick={submitFeedback}
            disabled={feedbackSubmitting}
            className="mt-5 rounded-xl bg-[#C2A36B] px-6 py-3 font-semibold text-white hover:bg-[#9B7A43] disabled:cursor-not-allowed disabled:opacity-50"
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
  {(userRole === "ADMIN" || userRole === "STAFF" || userRole === "CUSTOMER") && (
  <section className="rounded-2xl bg-white p-6 shadow-sm">
    <h3 className="text-xl font-bold">{userRole === "CUSTOMER" ? "My Feedback" : "Customer Reviews"}</h3>

    <p className="mt-1 text-sm text-slate-500">
      {userRole === "CUSTOMER" ? "Feedback submitted from your account." : "Reviews retrieved from the MongoDB customer_feedback collection."}
    </p>

    {feedbackLoading ? (
      <p className="mt-5 text-slate-500">Loading feedback...</p>
    ) : feedbackError ? (
      <div className="mt-5">
        <p className="text-red-600">{feedbackError}</p>
        <button
          onClick={fetchFeedback}
          className="mt-3 rounded-lg bg-[#C2A36B] px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    ) : feedbacks.length === 0 ? (
      <p className="mt-5 text-slate-500">
        {userRole === "CUSTOMER" ? "You have not submitted feedback yet." : "No customer feedback available yet."}
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
            className="mt-3 rounded-lg bg-[#C2A36B] px-4 py-2 text-white"
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
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Items</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Activity</th>
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
                  {order.payment_method ? (
                    <span className="text-xs font-semibold text-slate-600">{order.payment_method === "CASH" ? "Cash on Delivery" : `Demo ${order.payment_method}`} · {order.payment_status}</span>
                  ) : <span className="text-xs text-slate-400">Not recorded</span>}
                </td>

                <td className="p-3">
                  <div className="flex flex-col items-start gap-2">
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
                    {(userRole === "ADMIN" || userRole === "STAFF") && (
                      <select
                        aria-label={`Update order ${order.order_id} status`}
                        value={order.order_status}
                        disabled={orderUpdatingId === order.order_id || (nextOrderStatuses[order.order_status] || []).length === 0}
                        onChange={(event) => void updateOrderStatus(order.order_id, event.target.value)}
                        className="max-w-40 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value={order.order_status}>{order.order_status}</option>
                        {(nextOrderStatuses[order.order_status] || []).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
                <td className="p-3"><button onClick={() => void viewOrderActivity(order.order_id)} disabled={orderActivityLoading} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">History</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderPayments() {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{userRole === "CUSTOMER" ? "My Payment History" : "Payments"}</h2>
            <p className="mt-1 text-sm text-slate-500">{userRole === "CUSTOMER" ? "Payments linked to your orders." : "Payment records across all customer orders."}</p>
          </div>
          <button onClick={() => void fetchPayments()} disabled={paymentsLoading} className="rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50">{paymentsLoading ? "Refreshing…" : "Refresh payments"}</button>
        </div>

        {userRole === "ADMIN" && paymentSummary && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Paid Revenue</p><p className="mt-2 text-2xl font-bold">₹{Number(paymentSummary.total_revenue).toFixed(2)}</p><p className="mt-1 text-xs text-slate-400">Successful payments only</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Successful</p><p className="mt-2 text-2xl font-bold">{paymentSummary.successful_payments}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Pending</p><p className="mt-2 text-2xl font-bold">{paymentSummary.pending_payments}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Failed</p><p className="mt-2 text-2xl font-bold">{paymentSummary.failed_payments}</p></div>
          </div>
        )}

        {userRole === "ADMIN" && (
          <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="text-sm font-medium">Status <select aria-label="Filter payments by status" value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">All</option><option value="PENDING">Pending</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option><option value="REFUNDED">Refunded</option></select></label>
            <label className="text-sm font-medium">Method <select aria-label="Filter payments by method" value={paymentMethodFilter} onChange={(event) => setPaymentMethodFilter(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">All</option><option value="CASH">Cash on Delivery</option><option value="UPI">UPI Demo</option><option value="CARD">Card Demo</option></select></label>
          </div>
        )}

        {paymentsError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{paymentsError}</p>}
        {selectedPayment && (
          <section className="rounded-2xl border border-[#E9DFC9] bg-[#FAF8F2] p-5">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold">Payment #{selectedPayment.payment_id} details</h3><button onClick={() => setSelectedPayment(null)} className="text-sm font-semibold text-[#806333]">Close</button></div>
            <p className="mt-3 text-sm text-slate-700">Order #{selectedPayment.order_id} · ₹{Number(selectedPayment.amount).toFixed(2)} · {selectedPayment.payment_method} · {selectedPayment.payment_status}</p>
            {selectedPayment.customer_name && <p className="mt-1 text-sm text-slate-500">Customer: {selectedPayment.customer_name}</p>}
            <p className="mt-1 text-sm text-slate-500">Recorded {new Date(selectedPayment.payment_date).toLocaleString("en-IN")}</p>
          </section>
        )}

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {paymentsLoading ? <p className="p-6 text-slate-500">Loading payment history…</p> : payments.length === 0 ? <p className="p-6 text-slate-500">No payment records found.</p> : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Payment</th><th className="p-3">Order</th>{userRole === "ADMIN" && <th className="p-3">Customer</th>}<th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Actions</th></tr></thead>
              <tbody>{payments.map((payment) => (
                <tr key={payment.payment_id} className="border-t border-slate-100">
                  <td className="p-3 font-semibold">#{payment.payment_id}</td><td className="p-3">#{payment.order_id}</td>{userRole === "ADMIN" && <td className="p-3">{payment.customer_name || "Customer"}</td>}<td className="p-3 font-semibold">₹{Number(payment.amount).toFixed(2)}</td><td className="p-3">{payment.payment_method === "CASH" ? "Cash on Delivery" : `${payment.payment_method} demo`}</td><td className="p-3"><span className="rounded-full bg-[#F8F3E8] px-3 py-1 text-xs font-semibold text-[#806333]">{payment.payment_status}</span></td><td className="p-3">{new Date(payment.payment_date).toLocaleString("en-IN")}</td>
                  <td className="p-3"><div className="flex gap-2"><button onClick={() => void showPaymentDetails(payment.payment_id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">Details</button>{userRole === "ADMIN" && payment.payment_method === "CASH" && payment.payment_status === "PENDING" && <button onClick={() => void markCashCollected(payment.payment_id)} className="rounded-lg bg-[#C2A36B] px-3 py-1.5 text-xs font-semibold text-white">Mark collected</button>}{userRole === "CUSTOMER" && payment.payment_status === "FAILED" && payment.payment_method !== "CASH" && <button onClick={() => void retryFailedPayment(payment.order_id)} className="rounded-lg bg-[#C2A36B] px-3 py-1.5 text-xs font-semibold text-white">Retry demo</button>}</div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </section>
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
              className="mt-3 rounded-lg bg-[#C2A36B] px-4 py-2 text-white"
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

function renderProfile() {
  if (!currentUser) {
    return (
      <p className="rounded-2xl bg-white p-6 text-slate-500">
        Loading profile...
      </p>
    );
  }

  const initials = currentUser.full_name
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          My Profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          View your account information and profile details.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-[#C2A36B]" />

        <div className="px-7 pb-8">
          <div className="-mt-14 flex flex-wrap items-end gap-5">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-[#F2E8D2] text-4xl font-extrabold text-[#9B7A43] shadow-lg">
              {initials}
            </div>

            <div className="pb-2">
              <h3 className="text-2xl font-bold text-slate-900">
                {currentUser.full_name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="mt-9">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Account Information
              </h3>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                Active Session
              </span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Name
                </p>
                <p className="mt-2 font-bold text-slate-800">
                  {currentUser.full_name}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </p>
                <p className="mt-2 break-all font-bold text-slate-800">
                  {currentUser.email}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account Role
                </p>
                <p className="mt-2 font-bold text-[#9B7A43]">
                  {currentUser.role}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account Type
                </p>
                <p className="mt-2 font-bold text-slate-800">
                  Smart Canteen User
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-[#F8F3E8] p-5">
            <h4 className="font-bold text-[#5F4928]">
              Account Security
            </h4>
            <p className="mt-2 text-sm leading-6 text-[#765B31]">
              Your account is protected through authenticated sessions.
              Always log out when using a shared computer.
            </p>
            <button
              onClick={handleLogout}
              className="mt-4 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}


  // Sidebar navigation
  const navItems = [
    { name: "Overview", icon: "📊" },
    { name: "Food Menu", icon: "🍽️" },
    { name: "Categories", icon: "◈" },
    { name: "Orders", icon: "📦" },
    { name: "Payments", icon: "◈" },
    { name: "Inventory", icon: "📋" },
    { name: "Reports", icon: "📈" },
    { name: "Feedback", icon: "⭐" },
    { name: "My Profile", icon: "👤" },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (userRole === "ADMIN") return true;

    if (userRole === "STAFF") {
      return [
        "Overview", "Food Menu", "Orders", "Payments",
        "Reports", "Feedback", "My Profile",
      ].includes(item.name);
    }

    if (userRole === "CUSTOMER") {
      return [
        "Overview", "Food Menu", "Orders", "Payments",
        "Feedback", "My Profile",
      ].includes(item.name);
    }

    return false;
  });

  // Main application layout
  return (
    <div className="min-h-screen bg-[#F4F0E6] text-slate-800">
      <div className="flex min-h-screen flex-col md:flex-row">

        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col bg-[#062C24] text-white md:sticky md:top-0 md:h-screen md:w-[250px]">

          <div className="border-b border-white/10 px-6 py-7">
            <BrandLogo appearance="dark" size="compact" />
          </div>

          <div className="px-5 pt-7 pb-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
            Workspace
          </div>

          <nav className="flex gap-2 overflow-x-auto px-3 pb-4 md:flex-1 md:flex-col md:overflow-y-auto">
            {visibleNavItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex min-w-fit items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                  activeTab === item.name
                    ? "bg-[#C2A36B] text-white shadow-lg shadow-orange-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
                {activeTab === item.name && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden border-t border-white/10 p-5 md:block">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">
                Database Management
              </p>
              <p className="mt-2 text-xs text-slate-400">
                PostgreSQL + MongoDB
              </p>
              <p className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                System Active
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">

          <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur md:px-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#9B7A43]">
                Smart Canteen / Workspace
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {activeTab}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Manage your canteen operations efficiently.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                System Online
              </span>

              {currentUser && (
                <button
                  onClick={() => setActiveTab("My Profile")}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-[#C2A36B]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2E8D2] font-bold text-[#765B31]">
                    {currentUser.full_name
                      .split(" ")
                      .map((name) => name[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-slate-800">
                      {currentUser.full_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {currentUser.role}
                    </p>
                  </div>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] p-5 md:p-8">
            {activeTab === "Overview" && renderOverview()}
            {activeTab === "Food Menu" && renderFoodMenu()}
            {activeTab === "Categories" && userRole === "ADMIN" && renderCategories()}
            {activeTab === "Orders" && renderOrders()}
            {activeTab === "Payments" && (userRole === "ADMIN" || userRole === "CUSTOMER") && renderPayments()}
            {activeTab === "Inventory" && renderInventory()}
            {activeTab === "Reports" && renderReports()}
            {activeTab === "Feedback" && renderFeedback()}
            {activeTab === "My Profile" && renderProfile()}
          </div>

          <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-xs text-slate-400">
            Smart Canteen Management System · Academic DBMS Project
          </footer>
        </main>
      </div>
    </div>
  );
}
