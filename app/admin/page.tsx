"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Home,
  LogOut,
  Menu,
  PieChart,
  Plus,
  Settings,
  ShoppingCart,
  Sliders,
  Store,
  Users,
  X,
  Loader2,
  Paperclip,
  Printer,
  Package,
  Edit,
  LayoutGrid,
  Trash2,
  Armchair,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import axiosInstance from "../../lib/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const getAuthHeader = (currentRouter) => {
  const currentToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!currentToken) {
    console.warn("Token topilmadi. Avtorizatsiya headeri bo'sh bo'ladi.");
    if (!toast.isActive("no-token-error")) {
      toast.error("Avtorizatsiya tokeni topilmadi. Iltimos, qayta kiring.", {
        toastId: "no-token-error",
      });
    }
    if (
      currentRouter &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/auth"
    ) {
      try {
        currentRouter.replace("/auth");
      } catch (error) {
        console.error("Router redirection xatosi:", error);
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      }
    }
    return null;
  }
  return {
    Authorization: `Bearer ${currentToken}`,
  };
};

const getPaymentMethodDisplay = (method) => {
  if (!method) return "N/A";
  switch (method.toLowerCase()) {
    case "card":
      return "Karta";
    case "cash":
      return "Naqd";
    case "mobile":
      return "Mobil";
    default:
      return method;
  }
};

const roleTranslations = {
  waiter: "Ofitsiant",
  chef: "Oshpaz",
  cashier: "Kassir",
  delivery: "Yetkazib beruvchi",
  administrator: "Administrator",
};

const translateRole = (roleName) => {
  if (!roleName || typeof roleName !== "string") return "N/A";
  return roleTranslations[roleName.toLowerCase()] || roleName;
};

export default function AdminDashboardWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const queryClientHook = useQueryClient();

  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [dateRange, setDateRange] = useState("weekly");
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [isDeleteRoleConfirmOpen, setIsDeleteRoleConfirmOpen] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showEditEmployeeDialog, setShowEditEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isLoadingEmployeeDetails, setIsLoadingEmployeeDetails] =
    useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isLoadingRoleDetails, setIsLoadingRoleDetails] = useState(false);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoadingProductDetails, setIsLoadingProductDetails] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
  const [showDeleteCategoryConfirmDialog, setShowDeleteCategoryConfirmDialog] =
    useState(false);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [showAddTableDialog, setShowAddTableDialog] = useState(false);
  const [showEditTableDialog, setShowEditTableDialog] = useState(false);
  const [showDeleteTableConfirmDialog, setShowDeleteTableConfirmDialog] =
    useState(false);

  const [showAddTableTypeDialog, setShowAddTableTypeDialog] = useState(false);
  const [showEditTableTypeDialog, setShowEditTableTypeDialog] = useState(false);
  const [
    showDeleteTableTypeConfirmDialog,
    setShowDeleteTableTypeConfirmDialog,
  ] = useState(false);
  const [newTableType, setNewTableType] = useState({
    name: "",
    service_fee_percent: "",
  });
  const [editingTableType, setEditingTableType] = useState(null);
  const [tableTypeToDelete, setTableTypeToDelete] = useState(null);
  const [isAddingTableType, setIsAddingTableType] = useState(false);
  const [isUpdatingTableType, setIsUpdatingTableType] = useState(false);
  const [isDeletingTableType, setIsDeletingTableType] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    username: "",
    first_name: "",
    last_name: "",
    role_id: "",
    pin_code: "",
    is_active: true,
  });
  const [newRole, setNewRole] = useState({ name: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    is_active: true,
    category_id: "",
    cost_price: "",
    image: null,
  });
  const [newTable, setNewTable] = useState({
    name: "",
    zone: "",
    is_available: true,
    table_type_id: "",
  });
  const [editingTable, setEditingTable] = useState(null);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isUpdatingTable, setIsUpdatingTable] = useState(false);
  const [isDeletingTable, setIsDeletingTable] = useState(false);

  const [roleToDelete, setRoleToDelete] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState(null);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refresh");
    }
    setToken(null);
    queryClientHook.clear();
    toast.info("Tizimdan chiqdingiz.");
    router.replace("/auth");
  };

  const handleApiError = (error, contextMessage) => {
    console.error(`${contextMessage} xatolik:`, error);
    let errorDetail = `${contextMessage} xatolik yuz berdi.`;
    let shouldLogout = false;

    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        errorDetail = "Sessiya muddati tugagan yoki ruxsat yo'q.";
        if (!error.config?._retry) {
          shouldLogout = true;
        }
      } else {
        const data = error.response.data;
        if (data && typeof data === "object") {
          if (data.detail) {
            errorDetail = data.detail;
          } else if (data.message && typeof data.message === "string") {
            errorDetail = data.message;
          } else if (Array.isArray(data)) {
            errorDetail = data
              .map((err) =>
                typeof err === "string"
                  ? err
                  : err.field
                  ? `${err.field}: ${err.message}`
                  : JSON.stringify(err)
              )
              .join("; ");
          } else {
            if (
              contextMessage.toLowerCase().includes("kategoriya") &&
              data.name &&
              Array.isArray(data.name)
            ) {
              errorDetail = `Kategoriya nomi: ${data.name.join(", ")}`;
            } else if (
              contextMessage.toLowerCase().includes("stol") &&
              data.name &&
              Array.isArray(data.name)
            ) {
              errorDetail = `Stol nomi: ${data.name.join(", ")}`;
            } else if (
              contextMessage.toLowerCase().includes("stol") &&
              data.zone &&
              Array.isArray(data.zone)
            ) {
              errorDetail = `Stol zonasi: ${data.zone.join(", ")}`;
            } else if (
              contextMessage.toLowerCase().includes("stol turi") &&
              data.name &&
              Array.isArray(data.name)
            ) {
              errorDetail = `Stol turi nomi: ${data.name.join(", ")}`;
            } else if (
              contextMessage.toLowerCase().includes("stol turi") &&
              data.service_fee_percent &&
              Array.isArray(data.service_fee_percent)
            ) {
              errorDetail = `Xizmat haqi foizi: ${data.service_fee_percent.join(
                ", "
              )}`;
            } else {
              errorDetail = Object.entries(data)
                .map(
                  ([key, value]) =>
                    `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
                )
                .join("; ");
            }
          }
        } else if (typeof data === "string") {
          errorDetail = data;
        } else {
          errorDetail = `Serverdan kutilmagan javob (status: ${error.response.status}).`;
        }
        if (
          !shouldLogout &&
          contextMessage &&
          !errorDetail
            .toLowerCase()
            .startsWith(
              contextMessage.toLowerCase().split(":")[0].split(" ")[0]
            )
        ) {
          errorDetail = `${contextMessage}: ${errorDetail}`;
        }
      }
    } else if (error.request) {
      errorDetail = `${contextMessage}: Serverdan javob olinmadi. Internet aloqasini tekshiring.`;
    } else {
      errorDetail = `${contextMessage} xatolik: ${error.message}`;
    }

    const toastId = contextMessage.replace(/[^a-zA-Z0-9-_]/g, "");
    if (!toast.isActive(toastId)) {
      toast.error(errorDetail, { toastId: toastId });
    }

    if (shouldLogout) {
      setTimeout(handleLogout, 1500);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (
      !storedToken &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/auth"
    ) {
      router.replace("/auth");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const fetchDashboardData = async () => {
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) {
      throw new Error("Avtorizatsiya tokeni topilmadi.");
    }
    const results = await Promise.all([
      axiosInstance.get(`/orders/`),
      axiosInstance.get(`/admin/dashboard/stats/`),
      axiosInstance.get(`/admin/users/`),
      axiosInstance.get(`/admin/roles/`),
      axiosInstance.get(`/admin/reports/employees/`),
      axiosInstance.get(`/admin/reports/products/`),
      axiosInstance.get(`/products/`),
      axiosInstance.get(`/categories/`),
      axiosInstance.get(`/admin/reports/customers/`),
      axiosInstance.get(`/admin/reports/charts/`),
      axiosInstance.get(`/admin/dashboard/sales-chart/`),
      axiosInstance.get(`/tables/`),
      axiosInstance.get(`/admin/table-types/`),
    ]);

    return results.map((res) => res.data ?? null);
  };

  const {
    data: dashboardDataArray,
    isLoading: isLoadingDashboard,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboardData", token],
    queryFn: fetchDashboardData,
    enabled: !!token && isClient,
    refetchInterval: 10000,
    staleTime: 5000,
    onError: (err) => {
      handleApiError(err, "Asosiy ma'lumotlarni yuklashda");
    },
  });

  const fetchTopProducts = async ({ queryKey }) => {
    const [_key, range, currentToken] = queryKey;
    if (!currentToken) throw new Error("Token required for top products");

    const res = await axiosInstance.get(
      `/admin/dashboard/top-products/?period=${range}`
    );
    return res.data ?? [];
  };

  const {
    data: topProducts,
    isLoading: isLoadingTopProducts,
    error: topProductsError,
  } = useQuery({
    queryKey: ["topProducts", dateRange, token],
    queryFn: fetchTopProducts,
    enabled: !!token && isClient,
    staleTime: 60000,
    onError: (err) => {
      handleApiError(err, "Eng ko'p sotilgan mahsulotlarni yuklashda");
    },
  });

  const fetchSettings = async ({ queryKey }) => {
    const [_key, currentToken] = queryKey;
    if (!currentToken) throw new Error("Token required for settings");

    const res = await axiosInstance.get(`/admin/settings/`);
    return res.data || {};
  };

  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ["settings", token],
    queryFn: fetchSettings,
    enabled: !!token && isClient && activeTab === "settings",
    staleTime: 300000,
    refetchOnMount: true,
    onError: (err) => {
      console.error("Sozlamalarni yuklashda xatolik:", err);
      handleApiError(err, "Sozlamalarni yuklashda");
    },
  });

  const ordersRaw = dashboardDataArray?.[0] ?? [];
  const stats = dashboardDataArray?.[1] ?? {
    todays_sales: { value: 0, change_percent: 0, comparison_period: "N/A" },
    todays_orders: { value: 0, change_percent: 0, comparison_period: "N/A" },
    average_check: { value: 0, change_percent: 0, comparison_period: "N/A" },
    active_employees: {
      value: 0,
      change_absolute: 0,
      comparison_period: "N/A",
    },
  };
  const xodim = dashboardDataArray?.[2] ?? [];
  const rolesList = dashboardDataArray?.[3] ?? [];
  const fetchedRoles = rolesList;
  const employeeReport = dashboardDataArray?.[4] ?? [];
  const productReportData = dashboardDataArray?.[5] ?? [];
  const products = dashboardDataArray?.[6] ?? [];
  const categories = dashboardDataArray?.[7] ?? [];
  const customerReport = dashboardDataArray?.[8] ?? [];
  const chartsData = dashboardDataArray?.[9] ?? {
    payment_methods: [],
    order_types: [],
  };
  const paymentMethods = chartsData.payment_methods || [];
  const orderTypes = chartsData.order_types || [];
  const salesData = dashboardDataArray?.[10] ?? [];
  const tables = dashboardDataArray?.[11] ?? [];
  const tableTypes = dashboardDataArray?.[12] ?? [];

  const sortedOrders = Array.isArray(ordersRaw)
    ? [...ordersRaw].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : [];
  const orders = sortedOrders;
  const recentOrders = sortedOrders.slice(0, 5);

  const refreshOrders = () => {
    toast
      .promise(
        queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] }),
        {
          pending: "Buyurtmalar yangilanmoqda...",
          success: "Buyurtmalar muvaffaqiyatli yangilandi!",
          error: "Buyurtmalarni yangilashda xatolik!",
        }
      )
      .catch((err) => console.error("Buyurtma invalidatsiya xatosi:", err));
  };

  const refreshEmployees = () => {
    toast
      .promise(
        queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] }),
        {
          pending: "Xodimlar yangilanmoqda...",
          success: "Xodimlar ro'yxati yangilandi!",
          error: "Xodimlarni yangilashda xatolik!",
        }
      )
      .catch((err) => console.error("Xodim invalidatsiya xatosi:", err));
  };

  const refreshRoles = () => {
    toast
      .promise(
        queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] }),
        {
          pending: "Rollar yangilanmoqda...",
          success: "Rollar ro'yxati yangilandi!",
          error: "Rollarni yangilashda xatolik!",
        }
      )
      .catch((err) => console.error("Rol invalidatsiya xatosi:", err));
  };

  const refreshProducts = () => {
    toast
      .promise(
        queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] }),
        {
          pending: "Mahsulotlar yangilanmoqda...",
          success: "Mahsulotlar ro'yxati yangilandi!",
          error: "Mahsulotlarni yangilashda xatolik!",
        }
      )
      .catch((err) => console.error("Mahsulot invalidatsiya xatosi:", err));
  };

  const refreshCategories = () => {
    toast
      .promise(
        queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] }),
        {
          pending: "Kategoriyalar yangilanmoqda...",
          success: "Kategoriyalar ro'yxati yangilandi!",
          error: "Kategoriyalarni yangilashda xatolik!",
        }
      )
      .catch((err) => console.error("Kategoriya invalidatsiya xatosi:", err));
  };

  const refreshTables = () => {
    toast
      .promise(
        queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] }),
        {
          pending: "Stollar yangilanmoqda...",
          success: "Stollar ro'yxati yangilandi!",
          error: "Stollarni yangilashda xatolik!",
        }
      )
      .catch((err) => console.error("Stol invalidatsiya xatosi:", err));
  };

  const refreshTableTypes = () => {
    toast
      .promise(
        queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] }),
        {
          pending: "Stol turlari yangilanmoqda...",
          success: "Stol turlari ro'yxati yangilandi!",
          error: "Stol turlarini yangilashda xatolik!",
        }
      )
      .catch((err) => console.error("Stol turi invalidatsiya xatosi:", err));
  };

  const printCustomerReceiptAPI = async (orderDetails) => {
    if (!orderDetails || !orderDetails.id) {
      toast.error(
        "Mijoz chekini chop etish uchun buyurtma ma'lumotlari topilmadi!"
      );
      return;
    }
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const createdDate = new Date(orderDetails.created_at);
    const payload = {
      orderId: orderDetails.id,
      orderDate: `${String(createdDate.getDate()).padStart(2, "0")}/${String(
        createdDate.getMonth() + 1
      ).padStart(2, "0")}/${createdDate.getFullYear()}`,
      orderTime: `${String(createdDate.getHours()).padStart(2, "0")}:${String(
        createdDate.getMinutes()
      ).padStart(2, "0")}`,
      orderTypeDisplay: orderDetails.order_type_display || "N/A",
      waiterName: orderDetails.created_by
        ? `${orderDetails.created_by.first_name || ""} ${
            orderDetails.created_by.last_name || ""
          }`.trim()
        : "N/A",
      customerDetails: {
        tableName: orderDetails.table?.name || null,
        customerName: orderDetails.customer_name || null,
      },
      items: (orderDetails.items || []).map((item) => ({
        productName: item.product_details?.name || "Noma'lum mahsulot",
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalItemPrice: item.total_price,
      })),
      subtotal: orderDetails.total_price,
      serviceFeePercent:
        orderDetails.actual_service_fee_percent ||
        orderDetails.service_fee_percent ||
        "0.00",
      serviceFeeAmount: (
        parseFloat(orderDetails.final_price || 0) -
        parseFloat(orderDetails.total_price || 0)
      ).toFixed(2),
      taxPercent: "0.00",
      taxAmount: "0.00",
      finalPrice: orderDetails.final_price,
      paymentMethodDisplay: orderDetails.payment
        ? getPaymentMethodDisplay(orderDetails.payment.method)
        : null,
      paymentMethod: orderDetails.payment ? orderDetails.payment.method : null,
      receivedAmount: orderDetails.payment?.received_amount,
      changeAmount: orderDetails.payment?.change_amount,
    };

    if (!payload.items || payload.items.length === 0) {
      toast.error("Chekda chop etish uchun mahsulotlar yo'q.");
      return;
    }

    toast.promise(
      axiosInstance.post(`/print/customer/`, payload).then((response) => {
        if (response.data && response.data.success) {
          return response.data.message || "Mijoz cheki printerga yuborildi.";
        } else {
          throw new Error(
            response.data.message ||
              "Mijoz chekini chop etishda noma'lum xatolik."
          );
        }
      }),
      {
        pending: `Buyurtma #${orderDetails.id} uchun mijoz cheki chop etilmoqda...`,
        success: { render: ({ data }) => data },
        error: {
          render: ({ data }) => {
            handleApiError(
              data,
              `Mijoz chekini (ID: ${orderDetails.id}) chop etishda`
            );
            return "Mijoz chekini chop etishda xatolik!";
          },
        },
      }
    );
  };

  const printKitchenReceiptAPI = async (
    orderDetails,
    receiptType = "initial"
  ) => {
    if (!orderDetails || !orderDetails.id) {
      toast.error(
        "Oshxona chekini chop etish uchun buyurtma ma'lumotlari topilmadi!"
      );
      return;
    }
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const createdDate = new Date(orderDetails.created_at);
    const payload = {
      orderId: orderDetails.id,
      receiptType: receiptType,
      tableName: orderDetails.table?.name || null,
      orderTypeDisplay: orderDetails.order_type_display || "N/A",
      orderTime: `${String(createdDate.getHours()).padStart(2, "0")}:${String(
        createdDate.getMinutes()
      ).padStart(2, "0")}`,
      waiterName: orderDetails.created_by
        ? `${orderDetails.created_by.first_name || ""} ${
            orderDetails.created_by.last_name || ""
          }`.trim()
        : "N/A",
      items: (orderDetails.items || []).map((item) => ({
        productName: item.product_details?.name || "Noma'lum mahsulot",
        quantity: item.quantity,
      })),
      orderComment: orderDetails.comment || null,
    };

    if (!payload.items || payload.items.length === 0) {
      toast.error("Oshxona chekida chop etish uchun mahsulotlar yo'q.");
      return;
    }

    toast.promise(
      axiosInstance.post(`/print/kitchen/`, payload).then((response) => {
        if (response.data && response.data.success) {
          return response.data.message || "Oshxona cheki printerga yuborildi.";
        } else {
          throw new Error(
            response.data.message ||
              "Oshxona chekini chop etishda noma'lum xatolik."
          );
        }
      }),
      {
        pending: `Buyurtma #${orderDetails.id} uchun oshxona cheki chop etilmoqda...`,
        success: { render: ({ data }) => data },
        error: {
          render: ({ data }) => {
            handleApiError(
              data,
              `Oshxona chekini (ID: ${orderDetails.id}) chop etishda`
            );
            return "Oshxona chekini chop etishda xatolik!";
          },
        },
      }
    );
  };

  const handleCancelOrder = async (orderId) => {
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    toast.promise(
      axiosInstance
        .post(`/orders/${orderId}/cancel_order/`, {})
        .then((response) => {
          if (response.status === 200 || response.status === 204) {
            queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
            if (showOrderDetailsModal && selectedOrderDetails?.id === orderId) {
              handleShowOrderDetails(orderId);
            }
            return `Buyurtma #${orderId} muvaffaqiyatli bekor qilindi!`;
          } else {
            throw new Error(
              `Buyurtmani bekor qilishda kutilmagan javob: ${response.status}`
            );
          }
        }),
      {
        pending: `Buyurtma #${orderId} bekor qilinmoqda...`,
        success: { render: ({ data }) => data },
        error: {
          render: ({ data }) => {
            handleApiError(data, `Buyurtma #${orderId} ni bekor qilishda`);
            return `Buyurtma #${orderId} ni bekor qilishda xatolik!`;
          },
        },
      }
    );
  };

  const handleAddEmployee = async () => {
    if (
      !newEmployee.username ||
      !newEmployee.first_name ||
      !newEmployee.last_name ||
      !newEmployee.role_id ||
      !newEmployee.pin_code
    ) {
      toast.error("Iltimos, barcha yulduzchali (*) maydonlarni to'ldiring.");
      return;
    }
    if (!/^\d{4}$/.test(newEmployee.pin_code)) {
      toast.error("PIN-kod 4 ta raqamdan iborat bo'lishi kerak.");
      return;
    }
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const employeeData = {
      username: newEmployee.username.trim(),
      first_name: newEmployee.first_name.trim(),
      last_name: newEmployee.last_name.trim(),
      role_id: parseInt(newEmployee.role_id),
      pin_code: newEmployee.pin_code,
      is_active: newEmployee.is_active,
    };

    toast.promise(
      axiosInstance.post("/admin/users/", employeeData).then((response) => {
        if (response.status === 201) {
          queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
          setNewEmployee({
            username: "",
            first_name: "",
            last_name: "",
            role_id: "",
            pin_code: "",
            is_active: true,
          });
          setShowAddEmployeeDialog(false);
          return `Xodim "${employeeData.first_name}" muvaffaqiyatli qo'shildi!`;
        } else {
          throw new Error(
            `Xodim qo'shishda kutilmagan javob: ${response.status}`
          );
        }
      }),
      {
        pending: "Xodim qo'shilmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            handleApiError(data, "Xodim qo'shishda");
            return "Xodim qo'shishda xatolik!";
          },
        },
      }
    );
  };

  const handleEditEmployeeClick = async (employee) => {
    if (!employee || !employee.id) {
      toast.error("Xodim ma'lumotlarini olish uchun ID topilmadi.");
      return;
    }
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    setEditingEmployee(null);
    setShowEditEmployeeDialog(true);
    setIsLoadingEmployeeDetails(true);

    try {
      const response = await axiosInstance.get(`/admin/users/${employee.id}/`);
      if (response.data) {
        setEditingEmployee({
          ...response.data,
          role_id: response.data.role?.id,
          pin_code: "",
        });
      } else {
        throw new Error("Xodim ma'lumotlari topilmadi");
      }
    } catch (err) {
      handleApiError(err, `Xodim #${employee.id} ma'lumotlarini olishda`);
      setShowEditEmployeeDialog(false);
    } finally {
      setIsLoadingEmployeeDetails(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee || !editingEmployee.id) {
      toast.error("Tahrirlanayotgan xodim ma'lumotlari topilmadi.");
      return;
    }
    if (
      !editingEmployee.username ||
      !editingEmployee.first_name ||
      !editingEmployee.last_name ||
      !editingEmployee.role_id
    ) {
      toast.error(
        "Iltimos, username, ism, familiya va rol maydonlarini to'ldiring."
      );
      return;
    }
    if (
      !editingEmployee.pin_code ||
      !/^\d{4}$/.test(editingEmployee.pin_code)
    ) {
      toast.error(
        "PIN-kod 4 ta raqamdan iborat bo'lishi kerak va tahrirlashda majburiy."
      );
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const updateData = {
      username: editingEmployee.username.trim(),
      first_name: editingEmployee.first_name.trim(),
      last_name: editingEmployee.last_name.trim(),
      role_id: parseInt(editingEmployee.role_id),
      pin_code: editingEmployee.pin_code,
      is_active: editingEmployee.is_active,
    };

    const employeeId = editingEmployee.id;
    const employeeName = `${updateData.first_name} ${updateData.last_name}`;

    toast.promise(
      axiosInstance
        .put(`/admin/users/${employeeId}/`, updateData)
        .then((response) => {
          if (response.status === 200) {
            queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
            setShowEditEmployeeDialog(false);
            setEditingEmployee(null);
            return `Xodim "${employeeName}" ma'lumotlari muvaffaqiyatli yangilandi!`;
          } else {
            throw new Error(
              `Xodimni yangilashda kutilmagan javob: ${response.status}`
            );
          }
        }),
      {
        pending: "Xodim ma'lumotlari yangilanmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            handleApiError(data, `Xodim #${employeeId} ni yangilashda`);
            return "Xodimni yangilashda xatolik!";
          },
        },
      }
    );
  };

  const handleAddRole = async () => {
    if (!newRole.name || newRole.name.trim() === "") {
      toast.error("Iltimos, rol nomini kiriting.");
      return;
    }
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const roleData = { name: newRole.name.trim() };

    toast.promise(
      axiosInstance.post("/admin/roles/", roleData).then((response) => {
        if (response.status === 201) {
          queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
          setNewRole({ name: "" });
          setShowAddRoleDialog(false);
          return `Rol "${translateRole(
            roleData.name
          )}" muvaffaqiyatli qo'shildi!`;
        } else {
          throw new Error(
            `Rol qo'shishda kutilmagan javob: ${response.status}`
          );
        }
      }),
      {
        pending: "Rol qo'shilmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            handleApiError(data, "Rol qo'shishda");
            return "Rol qo'shishda xatolik!";
          },
        },
      }
    );
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
      toast.error("Iltimos, mahsulot nomi, narxi va kategoriyasini kiriting.");
      return;
    }
    if (
      isNaN(parseFloat(newProduct.price)) ||
      parseFloat(newProduct.price) <= 0
    ) {
      toast.error("Narx musbat raqam bo'lishi kerak.");
      return;
    }
    if (
      newProduct.cost_price &&
      (isNaN(parseFloat(newProduct.cost_price)) ||
        parseFloat(newProduct.cost_price) < 0)
    ) {
      toast.error("Tannarx manfiy bo'lmagan raqam bo'lishi kerak.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const formData = new FormData();
    formData.append("name", newProduct.name.trim());
    formData.append("price", parseFloat(newProduct.price).toFixed(2));
    formData.append("category_id", newProduct.category_id);
    if (newProduct.description) {
      formData.append("description", newProduct.description.trim());
    }
    if (newProduct.cost_price) {
      formData.append(
        "cost_price",
        parseFloat(newProduct.cost_price).toFixed(2)
      );
    }
    if (newProduct.image instanceof File) {
      formData.append("image", newProduct.image);
    }
    formData.append("is_active", newProduct.is_active ? "true" : "false");

    const productName = newProduct.name.trim();

    toast.promise(
      axiosInstance.post("/products/", formData).then((response) => {
        if (response.status === 201) {
          queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
          setNewProduct({
            name: "",
            price: "",
            description: "",
            is_active: true,
            category_id: "",
            cost_price: "",
            image: null,
          });
          setShowAddProductDialog(false);
          return `Mahsulot "${productName}" muvaffaqiyatli qo'shildi!`;
        } else {
          throw new Error(
            `Mahsulot qo'shishda kutilmagan javob: ${response.status}`
          );
        }
      }),
      {
        pending: "Mahsulot qo'shilmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            handleApiError(data, "Mahsulot qo'shishda");
            return "Mahsulot qo'shishda xatolik!";
          },
        },
      }
    );
  };

  const handleDeleteEmployee = async (employee) => {
    if (
      !confirm(
        `Haqiqatan ham "${employee.first_name} ${employee.last_name}" (ID: ${employee.id}) xodimni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`
      )
    )
      return;
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const employeeName = `${employee.first_name} ${employee.last_name}`;

    toast.promise(
      axiosInstance.delete(`/admin/users/${employee.id}/`).then((response) => {
        if (response.status === 204) {
          queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
          return `Xodim "${employeeName}" muvaffaqiyatli o'chirildi!`;
        } else {
          throw new Error(
            `Xodimni o'chirishda kutilmagan javob: ${response.status}`
          );
        }
      }),
      {
        pending: "Xodim o'chirilmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            handleApiError(data, `Xodim (ID: ${employee.id}) ni o'chirishda`);
            return `Xodimni o'chirishda xatolik!`;
          },
        },
      }
    );
  };

  const handleDeleteProduct = async (product) => {
    if (
      !confirm(
        `Haqiqatan ham "${product.name}" (ID: ${product.id}) mahsulotni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`
      )
    )
      return;
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const productName = product.name;

    toast.promise(
      axiosInstance.delete(`/products/${product.id}/`).then((response) => {
        if (response.status === 204) {
          queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
          return `Mahsulot "${productName}" muvaffaqiyatli o'chirildi!`;
        } else {
          throw new Error(
            `Mahsulotni o'chirishda kutilmagan javob: ${response.status}`
          );
        }
      }),
      {
        pending: "Mahsulot o'chirilmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            handleApiError(data, `Mahsulot (ID: ${product.id}) ni o'chirishda`);
            return `Mahsulotni o'chirishda xatolik!`;
          },
        },
      }
    );
  };

  const handleDeleteRole = (role) => {
    const currentRoleData = rolesList.find((r) => r.id === role.id);
    setRoleToDelete({
      id: role.id,
      name: role.name,
      employee_count: currentRoleData?.employee_count ?? 0,
    });
    setIsDeleteRoleConfirmOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete || !roleToDelete.id) return;
    if (roleToDelete.employee_count > 0) {
      toast.error(
        `"${translateRole(
          roleToDelete.name
        )}" rolini o'chirib bo'lmaydi, chunki unga ${
          roleToDelete.employee_count
        } ta xodim biriktirilgan.`
      );
      setIsDeleteRoleConfirmOpen(false);
      setRoleToDelete(null);
      return;
    }
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const roleName = roleToDelete.name;
    const translatedRoleName = translateRole(roleName);

    toast
      .promise(
        axiosInstance
          .delete(`/admin/roles/${roleToDelete.id}/`)
          .then((response) => {
            if (response.status === 204) {
              queryClientHook.invalidateQueries({
                queryKey: ["dashboardData"],
              });
              return `Rol "${translatedRoleName}" muvaffaqiyatli o'chirildi!`;
            } else {
              throw new Error(
                `Rolni o'chirishda kutilmagan javob: ${response.status}`
              );
            }
          }),
        {
          pending: "Rol o'chirilmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              if (
                data.response?.status === 400 &&
                data.response?.data?.detail
                  ?.toLowerCase()
                  .includes("cannot delete role with assigned users")
              ) {
                const count = roleToDelete.employee_count || "bir nechta";
                toast.error(
                  `"${translatedRoleName}" rolini o'chirib bo'lmaydi, chunki unga ${count} ta xodim biriktirilgan.`
                );
                return `"${translatedRoleName}" rolini o'chirib bo'lmaydi.`;
              } else {
                handleApiError(
                  data,
                  `"${translatedRoleName}" rolini o'chirishda`
                );
                return `Rolni o'chirishda xatolik!`;
              }
            },
          },
        }
      )
      .finally(() => {
        setIsDeleteRoleConfirmOpen(false);
        setRoleToDelete(null);
      });
  };

  const handleShowOrderDetails = async (orderId) => {
    if (!orderId) {
      console.error("Buyurtma ID si topilmadi!");
      toast.error("Buyurtma ID si topilmadi!", { toastId: "order-id-missing" });
      return;
    }
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    setShowOrderDetailsModal(true);
    setIsLoadingOrderDetails(true);
    setSelectedOrderDetails(null);
    setOrderDetailsError(null);

    try {
      const response = await axiosInstance.get(`/orders/${orderId}/`);
      if (response.data) {
        setSelectedOrderDetails(response.data);
      } else {
        throw new Error("API dan bo'sh ma'lumot qaytdi");
      }
      setOrderDetailsError(null);
    } catch (err) {
      handleApiError(err, `Buyurtma #${orderId} tafsilotlarini olishda`);
      setOrderDetailsError(
        `Tafsilotlarni yuklashda xatolik yuz berdi. Qaytadan urinib ko'ring.`
      );
      setSelectedOrderDetails(null);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  const handleModalClose = () => {
    setShowOrderDetailsModal(false);
    setTimeout(() => {
      setSelectedOrderDetails(null);
      setIsLoadingOrderDetails(false);
      setOrderDetailsError(null);
    }, 300);
  };

  const updateLocalSettings = (newSettingsData) => {
    queryClientHook.setQueryData(["settings", token], (oldData) => ({
      ...oldData,
      ...newSettingsData,
    }));
  };

  const handleUpdateSettings = async () => {
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    if (!settings || !settings.name || settings.name.trim() === "") {
      toast.error("Restoran nomi (*) majburiy maydon.");
      return;
    }

    const processedSettings = {
      ...settings,
      tax_percent:
        settings.tax_percent === null || settings.tax_percent === ""
          ? null
          : parseFloat(settings.tax_percent) || 0,
      service_fee_percent:
        settings.service_fee_percent === null ||
        settings.service_fee_percent === ""
          ? null
          : parseFloat(settings.service_fee_percent) || 0,
    };

    Object.keys(processedSettings).forEach((key) => {
      if (processedSettings[key] === "") {
        processedSettings[key] = null;
      }
    });

    toast.promise(
      axiosInstance
        .put(`/admin/settings/`, processedSettings)
        .then((response) => {
          if (response.status === 200) {
            queryClientHook.invalidateQueries({
              queryKey: ["settings", token],
            });
            return "Sozlamalar muvaffaqiyatli yangilandi!";
          } else {
            throw new Error(
              `Sozlamalarni yangilashda kutilmagan javob: ${response.status}`
            );
          }
        }),
      {
        pending: "Sozlamalar yangilanmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            refetchSettings();
            handleApiError(data, "Sozlamalarni yangilashda");
            return "Sozlamalarni yangilashda xatolik!";
          },
        },
      }
    );
  };

  const handleEditRoleClick = async (role) => {
    if (!role || !role.id) {
      toast.error("Rol ma'lumotlarini olish uchun ID topilmadi.");
      return;
    }
    setEditingRole({ id: role.id, name: role.name });
    setShowEditRoleDialog(true);
    setIsLoadingRoleDetails(false);
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.id || !editingRole.name?.trim()) {
      toast.error("Iltimos, rol nomini kiriting.");
      return;
    }
    if (
      editingRole.name.trim().length < 1 ||
      editingRole.name.trim().length > 100
    ) {
      toast.error("Rol nomi 1 dan 100 gacha belgidan iborat bo'lishi kerak.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const updateData = { name: editingRole.name.trim() };
    const roleId = editingRole.id;
    const roleName = updateData.name;
    const translatedRoleName = translateRole(roleName);

    toast.promise(
      axiosInstance
        .put(`/admin/roles/${roleId}/`, updateData)
        .then((response) => {
          if (response.status === 200) {
            queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
            setShowEditRoleDialog(false);
            setEditingRole(null);
            return `Rol "${translatedRoleName}" muvaffaqiyatli yangilandi!`;
          } else {
            throw new Error(
              `Rolni yangilashda kutilmagan javob: ${response.status}`
            );
          }
        }),
      {
        pending: "Rol yangilanmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            handleApiError(
              data,
              `Rol #${roleId} ("${translatedRoleName}") ni yangilashda`
            );
            return "Rolni yangilashda xatolik!";
          },
        },
      }
    );
  };

  const handleEditProductClick = async (product) => {
    if (!product || !product.id) {
      toast.error("Mahsulot ma'lumotlarini olish uchun ID topilmadi.");
      return;
    }
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    setEditingProduct(null);
    setShowEditProductDialog(true);
    setIsLoadingProductDetails(true);

    try {
      const response = await axiosInstance.get(`/products/${product.id}/`);
      if (response.data) {
        setEditingProduct({
          ...response.data,
          price: response.data.price?.toString() || "",
          cost_price: response.data.cost_price?.toString() || "",
          category_id: response.data.category?.id?.toString() || "",
          newImage: null,
        });
      } else {
        throw new Error("Mahsulot ma'lumotlari topilmadi");
      }
    } catch (err) {
      handleApiError(err, `Mahsulot #${product.id} ma'lumotlarini olishda`);
      setShowEditProductDialog(false);
    } finally {
      setIsLoadingProductDetails(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editingProduct.id) {
      toast.error("Tahrirlanayotgan mahsulot ma'lumotlari topilmadi.");
      return;
    }
    if (
      !editingProduct.name ||
      !editingProduct.price ||
      !editingProduct.category_id
    ) {
      toast.error("Iltimos, mahsulot nomi, narxi va kategoriyasini kiriting.");
      return;
    }
    if (
      isNaN(parseFloat(editingProduct.price)) ||
      parseFloat(editingProduct.price) <= 0
    ) {
      toast.error("Narx musbat raqam bo'lishi kerak.");
      return;
    }
    if (
      editingProduct.cost_price &&
      (isNaN(parseFloat(editingProduct.cost_price)) ||
        parseFloat(editingProduct.cost_price) < 0)
    ) {
      toast.error("Tannarx manfiy bo'lmagan raqam bo'lishi kerak.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const formData = new FormData();
    formData.append("name", editingProduct.name.trim());
    formData.append("price", parseFloat(editingProduct.price).toFixed(2));
    formData.append("category_id", editingProduct.category_id);
    formData.append("is_active", editingProduct.is_active ? "true" : "false");
    if (editingProduct.description) {
      formData.append("description", editingProduct.description.trim());
    }
    if (editingProduct.cost_price) {
      formData.append(
        "cost_price",
        parseFloat(editingProduct.cost_price).toFixed(2)
      );
    }
    if (editingProduct.newImage instanceof File) {
      formData.append("image", editingProduct.newImage);
    }

    const productId = editingProduct.id;
    const productName = editingProduct.name.trim();
    setIsUpdatingProduct(true);

    toast
      .promise(
        axiosInstance
          .put(`/products/${productId}/`, formData)
          .then((response) => {
            if (response.status === 200) {
              queryClientHook.invalidateQueries({
                queryKey: ["dashboardData"],
              });
              setShowEditProductDialog(false);
              setEditingProduct(null);
              return `Mahsulot "${productName}" muvaffaqiyatli yangilandi!`;
            } else {
              throw new Error(
                `Mahsulotni yangilashda kutilmagan javob: ${response.status}`
              );
            }
          }),
        {
          pending: "Mahsulot yangilanmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              handleApiError(data, `Mahsulot #${productId} ni yangilashda`);
              return "Mahsulotni yangilashda xatolik!";
            },
          },
        }
      )
      .finally(() => {
        setIsUpdatingProduct(false);
      });
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || newCategory.name.trim() === "") {
      toast.error("Iltimos, kategoriya nomini kiriting.");
      return;
    }
    if (newCategory.name.trim().length > 100) {
      toast.error("Kategoriya nomi 100 belgidan oshmasligi kerak.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const categoryData = { name: newCategory.name.trim() };

    toast.promise(
      axiosInstance.post("/categories/", categoryData).then((response) => {
        if (response.status === 201) {
          queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
          setNewCategory({ name: "" });
          setShowAddCategoryDialog(false);
          return `Kategoriya "${categoryData.name}" muvaffaqiyatli qo'shildi!`;
        } else {
          throw new Error(
            `Kategoriya qo'shishda kutilmagan javob: ${response.status}`
          );
        }
      }),
      {
        pending: "Kategoriya qo'shilmoqda...",
        success: {
          render({ data }) {
            return data;
          },
        },
        error: {
          render({ data }) {
            handleApiError(data, "Kategoriya qo'shishda");
            return "Kategoriya qo'shishda xatolik!";
          },
        },
      }
    );
  };

  const handleEditCategoryClick = (category) => {
    if (!category || !category.id) {
      toast.error("Kategoriyani tahrirlash uchun ID topilmadi.");
      return;
    }
    setEditingCategory({ id: category.id, name: category.name });
    setShowEditCategoryDialog(true);
  };

  const handleUpdateCategory = async () => {
    if (
      !editingCategory ||
      !editingCategory.id ||
      !editingCategory.name?.trim()
    ) {
      toast.error("Iltimos, kategoriya nomini kiriting.");
      return;
    }
    if (editingCategory.name.trim().length > 100) {
      toast.error("Kategoriya nomi 100 belgidan oshmasligi kerak.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const updateData = { name: editingCategory.name.trim() };
    const categoryId = editingCategory.id;
    const categoryName = updateData.name;
    setIsUpdatingCategory(true);

    toast
      .promise(
        axiosInstance
          .put(`/categories/${categoryId}/`, updateData)
          .then((response) => {
            if (response.status === 200) {
              queryClientHook.invalidateQueries({
                queryKey: ["dashboardData"],
              });
              setShowEditCategoryDialog(false);
              setEditingCategory(null);
              return `Kategoriya "${categoryName}" muvaffaqiyatli yangilandi!`;
            } else {
              throw new Error(
                `Kategoriyani yangilashda kutilmagan javob: ${response.status}`
              );
            }
          }),
        {
          pending: "Kategoriya yangilanmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              handleApiError(
                data,
                `Kategoriya #${categoryId} ("${categoryName}") ni yangilashda`
              );
              return "Kategoriyani yangilashda xatolik!";
            },
          },
        }
      )
      .finally(() => {
        setIsUpdatingCategory(false);
      });
  };

  const handleDeleteCategoryClick = (category) => {
    if (!category || !category.id) {
      toast.error("Kategoriyani o'chirish uchun ID topilmadi.");
      return;
    }
    setCategoryToDelete({ id: category.id, name: category.name });
    setShowDeleteCategoryConfirmDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete || !categoryToDelete.id) return;

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const categoryId = categoryToDelete.id;
    const categoryName = categoryToDelete.name;
    setIsDeletingCategory(true);

    toast
      .promise(
        axiosInstance.delete(`/categories/${categoryId}/`).then((response) => {
          if (response.status === 204) {
            queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
            return `Kategoriya "${categoryName}" muvaffaqiyatli o'chirildi!`;
          } else {
            throw new Error(
              `Kategoriyani o'chirishda kutilmagan javob: ${response.status}`
            );
          }
        }),
        {
          pending: "Kategoriya o'chirilmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              if (data.response?.status === 400) {
                const detail =
                  data.response?.data?.detail ||
                  "Bog'liq mahsulotlar mavjud bo'lishi mumkin.";
                handleApiError(
                  data,
                  `"${categoryName}" kategoriyasini o'chirishda (${detail})`
                );
                return `"${categoryName}" kategoriyasini o'chirishda xatolik: ${detail}`;
              } else {
                handleApiError(
                  data,
                  `"${categoryName}" kategoriyasini o'chirishda`
                );
                return `Kategoriyani o'chirishda xatolik!`;
              }
            },
          },
        }
      )
      .finally(() => {
        setShowDeleteCategoryConfirmDialog(false);
        setCategoryToDelete(null);
        setIsDeletingCategory(false);
      });
  };

  const handleAddTableType = async () => {
    if (!newTableType.name || newTableType.name.trim() === "") {
      toast.error("Iltimos, stol turi nomini kiriting.");
      return;
    }
    if (
      !newTableType.service_fee_percent ||
      isNaN(parseFloat(newTableType.service_fee_percent))
    ) {
      toast.error("Iltimos, xizmat haqi foizini raqamda kiriting.");
      return;
    }
    const fee = parseFloat(newTableType.service_fee_percent);
    if (fee < 0 || fee > 100) {
      toast.error("Xizmat haqi foizi 0 dan 100 gacha bo'lishi kerak.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const tableTypeData = {
      name: newTableType.name.trim(),
      service_fee_percent: parseFloat(newTableType.service_fee_percent).toFixed(
        2
      ),
    };
    setIsAddingTableType(true);

    toast
      .promise(
        axiosInstance
          .post("/admin/table-types/", tableTypeData)
          .then((response) => {
            if (response.status === 201) {
              refreshTableTypes();
              setNewTableType({ name: "", service_fee_percent: "" });
              setShowAddTableTypeDialog(false);
              return `Stol turi "${tableTypeData.name}" muvaffaqiyatli qo'shildi!`;
            } else {
              throw new Error(
                `Stol turi qo'shishda kutilmagan javob: ${response.status}`
              );
            }
          }),
        {
          pending: "Stol turi qo'shilmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              handleApiError(data, "Stol turi qo'shishda");
              return "Stol turi qo'shishda xatolik!";
            },
          },
        }
      )
      .finally(() => {
        setIsAddingTableType(false);
      });
  };

  const handleEditTableTypeClick = (tableType) => {
    if (!tableType || !tableType.id) {
      toast.error("Stol turini tahrirlash uchun ID topilmadi.");
      return;
    }
    setEditingTableType({
      id: tableType.id,
      name: tableType.name || "",
      service_fee_percent: tableType.service_fee_percent || "",
    });
    setShowEditTableTypeDialog(true);
  };

  const handleUpdateTableType = async () => {
    if (!editingTableType || !editingTableType.id) {
      toast.error("Tahrirlanayotgan stol turi ma'lumotlari topilmadi.");
      return;
    }
    if (!editingTableType.name || editingTableType.name.trim() === "") {
      toast.error("Iltimos, stol turi nomini kiriting.");
      return;
    }
    if (
      !editingTableType.service_fee_percent ||
      isNaN(parseFloat(editingTableType.service_fee_percent))
    ) {
      toast.error("Iltimos, xizmat haqi foizini raqamda kiriting.");
      return;
    }
    const fee = parseFloat(editingTableType.service_fee_percent);
    if (fee < 0 || fee > 100) {
      toast.error("Xizmat haqi foizi 0 dan 100 gacha bo'lishi kerak.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const updateData = {
      name: editingTableType.name.trim(),
      service_fee_percent: parseFloat(
        editingTableType.service_fee_percent
      ).toFixed(2),
    };
    const tableTypeId = editingTableType.id;
    const tableTypeName = updateData.name;
    setIsUpdatingTableType(true);

    toast
      .promise(
        axiosInstance
          .put(`/admin/table-types/${tableTypeId}/`, updateData)
          .then((response) => {
            if (response.status === 200) {
              refreshTableTypes();
              setShowEditTableTypeDialog(false);
              setEditingTableType(null);
              return `Stol turi "${tableTypeName}" muvaffaqiyatli yangilandi!`;
            } else {
              throw new Error(
                `Stol turini yangilashda kutilmagan javob: ${response.status}`
              );
            }
          }),
        {
          pending: "Stol turi yangilanmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              handleApiError(
                data,
                `Stol turi #${tableTypeId} ("${tableTypeName}") ni yangilashda`
              );
              return "Stol turini yangilashda xatolik!";
            },
          },
        }
      )
      .finally(() => {
        setIsUpdatingTableType(false);
      });
  };

  const handleDeleteTableTypeClick = (tableType) => {
    if (!tableType || !tableType.id) {
      toast.error("Stol turini o'chirish uchun ID topilmadi.");
      return;
    }
    setTableTypeToDelete({ id: tableType.id, name: tableType.name });
    setShowDeleteTableTypeConfirmDialog(true);
  };

  const confirmDeleteTableType = async () => {
    if (!tableTypeToDelete || !tableTypeToDelete.id) return;

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const tableTypeId = tableTypeToDelete.id;
    const tableTypeName = tableTypeToDelete.name;
    setIsDeletingTableType(true);

    toast
      .promise(
        axiosInstance
          .delete(`/admin/table-types/${tableTypeId}/`)
          .then((response) => {
            if (response.status === 204) {
              refreshTableTypes();
              return `Stol turi "${tableTypeName}" (ID: ${tableTypeId}) muvaffaqiyatli o'chirildi!`;
            } else {
              throw new Error(
                `Stol turini o'chirishda kutilmagan javob: ${response.status}`
              );
            }
          }),
        {
          pending: "Stol turi o'chirilmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              handleApiError(
                data,
                `Stol turi "${tableTypeName}" (ID: ${tableTypeId}) ni o'chirishda`
              );
              return `Stol turini o'chirishda xatolik! Agar bu stol turiga bog'liq stollar mavjud bo'lsa, o'chirish mumkin emas.`;
            },
          },
        }
      )
      .finally(() => {
        setShowDeleteTableTypeConfirmDialog(false);
        setTableTypeToDelete(null);
        setIsDeletingTableType(false);
      });
  };

  const handleAddTable = async () => {
    if (!newTable.name || newTable.name.trim() === "") {
      toast.error("Iltimos, stol nomini/raqamini kiriting.");
      return;
    }
    if (newTable.name.trim().length < 1 || newTable.name.trim().length > 50) {
      toast.error("Stol nomi 1 dan 50 gacha belgidan iborat bo'lishi kerak.");
      return;
    }
    if (newTable.zone && newTable.zone.trim().length > 50) {
      toast.error("Zona nomi 50 belgidan oshmasligi kerak.");
      return;
    }
    if (!newTable.table_type_id) {
      toast.error("Iltimos, stol turini tanlang.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const tableData = {
      name: newTable.name.trim(),
      zone: newTable.zone?.trim() || null,
      is_available: newTable.is_available,
      table_type_id: parseInt(newTable.table_type_id),
    };
    setIsAddingTable(true);

    toast
      .promise(
        axiosInstance.post("/tables/", tableData).then((response) => {
          if (response.status === 201) {
            refreshTables();
            setNewTable({
              name: "",
              zone: "",
              is_available: true,
              table_type_id: "",
            });
            setShowAddTableDialog(false);
            return `Stol "${tableData.name}" muvaffaqiyatli qo'shildi!`;
          } else {
            throw new Error(
              `Stol qo'shishda kutilmagan javob: ${response.status}`
            );
          }
        }),
        {
          pending: "Stol qo'shilmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              handleApiError(data, "Stol qo'shishda");
              return "Stol qo'shishda xatolik!";
            },
          },
        }
      )
      .finally(() => {
        setIsAddingTable(false);
      });
  };

  const handleEditTableClick = (table) => {
    if (!table || !table.id) {
      toast.error("Stolni tahrirlash uchun ID topilmadi.");
      return;
    }
    setEditingTable({
      id: table.id,
      name: table.name || "",
      zone: table.zone || "",
      is_available: table.is_available ?? true,
      table_type_id: table.table_type?.id?.toString() || "",
    });
    setShowEditTableDialog(true);
  };

  const handleUpdateTable = async () => {
    if (!editingTable || !editingTable.id) {
      toast.error("Tahrirlanayotgan stol ma'lumotlari topilmadi.");
      return;
    }
    if (!editingTable.name || editingTable.name.trim() === "") {
      toast.error("Iltimos, stol nomini/raqamini kiriting.");
      return;
    }
    if (
      editingTable.name.trim().length < 1 ||
      editingTable.name.trim().length > 50
    ) {
      toast.error("Stol nomi 1 dan 50 gacha belgidan iborat bo'lishi kerak.");
      return;
    }
    if (editingTable.zone && editingTable.zone.trim().length > 50) {
      toast.error("Zona nomi 50 belgidan oshmasligi kerak.");
      return;
    }
    if (!editingTable.table_type_id) {
      toast.error("Iltimos, stol turini tanlang.");
      return;
    }

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const updateData = {
      name: editingTable.name.trim(),
      zone: editingTable.zone?.trim() || null,
      is_available: editingTable.is_available,
      table_type_id: parseInt(editingTable.table_type_id),
    };
    const tableId = editingTable.id;
    const tableName = updateData.name;
    setIsUpdatingTable(true);

    toast
      .promise(
        axiosInstance
          .put(`/tables/${tableId}/`, updateData)
          .then((response) => {
            if (response.status === 200) {
              refreshTables();
              setShowEditTableDialog(false);
              setEditingTable(null);
              return `Stol "${tableName}" muvaffaqiyatli yangilandi!`;
            } else {
              throw new Error(
                `Stolni yangilashda kutilmagan javob: ${response.status}`
              );
            }
          }),
        {
          pending: "Stol yangilanmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              handleApiError(
                data,
                `Stol #${tableId} ("${tableName}") ni yangilashda`
              );
              return "Stolni yangilashda xatolik!";
            },
          },
        }
      )
      .finally(() => {
        setIsUpdatingTable(false);
      });
  };

  const handleDeleteTableClick = (table) => {
    if (!table || !table.id) {
      toast.error("Stolni o'chirish uchun ID topilmadi.");
      return;
    }
    setTableToDelete({ id: table.id, name: table.name });
    setShowDeleteTableConfirmDialog(true);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete || !tableToDelete.id) return;

    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) return;

    const tableId = tableToDelete.id;
    const tableName = tableToDelete.name;
    setIsDeletingTable(true);

    toast
      .promise(
        axiosInstance.delete(`/tables/${tableId}/`).then((response) => {
          if (response.status === 204) {
            queryClientHook.invalidateQueries({ queryKey: ["dashboardData"] });
            return `Stol "${tableName}" (ID: ${tableId}) muvaffaqiyatli o'chirildi!`;
          } else {
            throw new Error(
              `Stolni o'chirishda kutilmagan javob: ${response.status}`
            );
          }
        }),
        {
          pending: "Stol o'chirilmoqda...",
          success: {
            render({ data }) {
              return data;
            },
          },
          error: {
            render({ data }) {
              handleApiError(
                data,
                `Stol "${tableName}" (ID: ${tableId}) ni o'chirishda`
              );
              return `Stolni o'chirishda xatolik!`;
            },
          },
        }
      )
      .finally(() => {
        setShowDeleteTableConfirmDialog(false);
        setTableToDelete(null);
        setIsDeletingTable(false);
      });
  };

  const safeArray = (data) => (Array.isArray(data) ? data : []);

  const displayedOrders = showAllOrders
    ? safeArray(orders)
    : safeArray(recentOrders);
  const validSalesData = safeArray(salesData);
  const validPaymentMethods = safeArray(paymentMethods);
  const validOrderTypes = safeArray(orderTypes);
  const validFetchedRoles = safeArray(fetchedRoles);
  const validXodim = safeArray(xodim);
  const validOrders = safeArray(orders);
  const validEmployeeReport = safeArray(employeeReport);
  const validProducts = safeArray(products);
  const validRolesList = safeArray(rolesList);
  const validTopProducts = safeArray(topProducts ?? []);
  const validCategories = safeArray(categories);
  const validProductReportData = safeArray(productReportData);
  const validCustomerReport = safeArray(customerReport);
  const validTables = safeArray(tables);
  const validTableTypes = safeArray(tableTypes);

  if (!isClient || !token || (isLoadingDashboard && !dashboardDataArray)) {
    if (typeof window !== "undefined" && window.location.pathname === "/auth") {
      return null;
    }
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
        <ToastContainer />
      </div>
    );
  }

  if (dashboardError && !dashboardDataArray) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-red-600 dark:text-red-400">
        <X className="h-12 w-12 mb-4" />
        <p className="text-xl font-semibold mb-2">
          Ma'lumotlarni yuklashda xatolik!
        </p>
        <p className="text-center max-w-md mb-4">
          Server bilan bog'lanishda muammo yuz berdi. Internet aloqangizni
          tekshiring yoki keyinroq qayta urinib ko'ring.
        </p>
        <Button
          onClick={() =>
            queryClientHook.refetchQueries({ queryKey: ["dashboardData"] })
          }
        >
          <Paperclip className="mr-2 h-4 w-4" /> Qayta urinish
        </Button>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <aside className="hidden w-64 flex-col bg-slate-900 text-white md:flex dark:bg-slate-800">
        <div className="flex h-14 items-center border-b border-slate-700 px-4 dark:border-slate-600">
          <Store className="mr-2 h-6 w-6 text-sky-400" />
          <h1 className="text-lg font-bold">SmartResto Admin</h1>
        </div>
        <ScrollArea className="flex-1">
          <nav className="px-3 py-4">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Asosiy
            </h2>
            <div className="space-y-1">
              <Button
                variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "dashboard"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Boshqaruv paneli
              </Button>
              <Button
                variant={activeTab === "reports" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "reports"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("reports")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Hisobotlar
              </Button>
              <Button
                variant={activeTab === "employees" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "employees"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("employees")}
              >
                <Users className="mr-2 h-4 w-4" />
                Xodimlar
              </Button>
              <Button
                variant={activeTab === "roles" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "roles"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("roles")}
              >
                <Sliders className="mr-2 h-4 w-4" />
                Rollar
              </Button>
              <Button
                variant={activeTab === "orders" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "orders"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("orders")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buyurtmalar
              </Button>
              <Button
                variant={activeTab === "products" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "products"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("products")}
              >
                <Package className="mr-2 h-4 w-4" />
                Mahsulotlar
              </Button>
              <Button
                variant={activeTab === "categories" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "categories"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("categories")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Kategoriyalar
              </Button>
              <Button
                variant={activeTab === "tables" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "tables"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("tables")}
              >
                <Armchair className="mr-2 h-4 w-4" />
                Stollar
              </Button>
              <Button
                variant={activeTab === "table-types" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "table-types"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("table-types")}
              >
                <Sliders className="mr-2 h-4 w-4" />
                Stol Turlari
              </Button>
            </div>
            <h2 className="mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tizim
            </h2>
            <div className="space-y-1">
              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === "settings"
                    ? "bg-slate-700 dark:bg-slate-600 text-white"
                    : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Sozlamalar
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-900/30 hover:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Chiqish
              </Button>
            </div>
          </nav>
        </ScrollArea>
        <div className="border-t border-slate-700 p-4 dark:border-slate-600">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>

      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          ></div>
          <aside
            className="fixed left-0 top-0 h-full w-64 flex flex-col bg-slate-900 text-white dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-700 px-4 dark:border-slate-600">
              <div className="flex items-center">
                <Store className="mr-2 h-6 w-6 text-sky-400" />
                <h1 className="text-lg font-bold">SmartResto</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <nav className="px-3 py-4">
                <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Asosiy
                </h2>
                <div className="space-y-1">
                  {[
                    {
                      name: "dashboard",
                      label: "Boshqaruv paneli",
                      icon: BarChart3,
                    },
                    { name: "reports", label: "Hisobotlar", icon: FileText },
                    { name: "employees", label: "Xodimlar", icon: Users },
                    { name: "roles", label: "Rollar", icon: Sliders },
                    {
                      name: "orders",
                      label: "Buyurtmalar",
                      icon: ShoppingCart,
                    },
                    { name: "products", label: "Mahsulotlar", icon: Package },
                    {
                      name: "categories",
                      label: "Kategoriyalar",
                      icon: LayoutGrid,
                    },
                    { name: "tables", label: "Stollar", icon: Armchair },
                    {
                      name: "table-types",
                      label: "Stol Turlari",
                      icon: Sliders,
                    },
                  ].map((item) => (
                    <Button
                      key={item.name}
                      variant={activeTab === item.name ? "secondary" : "ghost"}
                      className={`w-full justify-start ${
                        activeTab === item.name
                          ? "bg-slate-700 dark:bg-slate-600 text-white"
                          : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                      }`}
                      onClick={() => {
                        setActiveTab(item.name);
                        setShowMobileSidebar(false);
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </div>
                <h2 className="mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Tizim
                </h2>
                <div className="space-y-1">
                  <Button
                    variant={activeTab === "settings" ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      activeTab === "settings"
                        ? "bg-slate-700 dark:bg-slate-600 text-white"
                        : "hover:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-300 hover:text-white"
                    }`}
                    onClick={() => {
                      setActiveTab("settings");
                      setShowMobileSidebar(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Sozlamalar
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-700"
                    onClick={() => {
                      router.push("/pos");
                      setShowMobileSidebar(false);
                    }}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    POS ga qaytish
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:bg-red-900/30 hover:text-red-400"
                    onClick={() => {
                      handleLogout();
                      setShowMobileSidebar(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Chiqish
                  </Button>
                </div>
              </nav>
            </ScrollArea>
            <div className="border-t border-slate-700 p-4 dark:border-slate-600">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-white px-4 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
              <Store className="h-6 w-6 text-sky-400" />
              <h1 className="ml-2 text-lg font-bold">SmartResto</h1>
            </div>
          </div>
          <div className="hidden md:flex">
            {isLoadingDashboard && (
              <span className="text-xs text-muted-foreground flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Yangilanmoqda...
              </span>
            )}
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex gap-1 text-sm"
            >
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString("uz-UZ", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mening hisobim</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Sozlamalar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 bg-slate-100 dark:bg-slate-950">
          {activeTab === "dashboard" && (
            <div className="grid gap-4 md:gap-6 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bugungi savdo
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.todays_sales?.value ?? 0).toLocaleString()} so'm
                  </div>
                  <p
                    className={`text-xs ${
                      stats?.todays_sales?.change_percent ?? 0 >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    } dark:${
                      stats?.todays_sales?.change_percent ?? 0 >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {stats?.todays_sales?.change_percent ?? 0 >= 0 ? "+" : ""}
                    {stats?.todays_sales?.change_percent?.toFixed(1) ?? 0}% vs{" "}
                    {stats?.todays_sales?.comparison_period || "kecha"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bugungi Buyurtmalar
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{stats?.todays_orders?.value ?? 0}
                  </div>
                  <p
                    className={`text-xs ${
                      stats?.todays_orders?.change_percent ?? 0 >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    } dark:${
                      stats?.todays_orders?.change_percent ?? 0 >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {stats?.todays_orders?.change_percent ?? 0 >= 0 ? "+" : ""}
                    {stats?.todays_orders?.change_percent?.toFixed(1) ?? 0}% vs{" "}
                    {stats?.todays_orders?.comparison_period || "kecha"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    O'rtacha chek
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.average_check?.value ?? 0).toLocaleString()} so'm
                  </div>
                  <p
                    className={`text-xs ${
                      stats?.average_check?.change_percent ?? 0 >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    } dark:${
                      stats?.average_check?.change_percent ?? 0 >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {stats?.average_check?.change_percent ?? 0 >= 0 ? "+" : ""}
                    {stats?.average_check?.change_percent?.toFixed(1) ?? 0}% vs{" "}
                    {stats?.average_check?.comparison_period || "kecha"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faol xodimlar
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.active_employees?.value ?? 0}
                  </div>
                  <p
                    className={`text-xs ${
                      stats?.active_employees?.change_absolute ?? 0 >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    } dark:${
                      stats?.active_employees?.change_absolute ?? 0 >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {(stats?.active_employees?.change_absolute ?? 0) >= 0
                      ? "+"
                      : ""}
                    {stats?.active_employees?.change_absolute ?? 0} vs{" "}
                    {stats?.active_employees?.comparison_period || "kecha"}
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-full lg:col-span-2">
                <CardHeader>
                  <CardTitle>Savdo dinamikasi (Oxirgi 7 kun)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 pr-4">
                  {isClient && validSalesData.length > 0 ? (
                    <div className="h-[250px] w-full">
                      <Chart
                        options={{
                          chart: {
                            id: "weekly-sales-chart",
                            toolbar: { show: false },
                            background: "transparent",
                          },
                          theme: {
                            mode:
                              typeof window !== "undefined" &&
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "dark"
                                : "light",
                          },
                          xaxis: {
                            categories: validSalesData.map((day) =>
                              new Date(day.date).toLocaleDateString("uz-UZ", {
                                day: "numeric",
                                month: "short",
                              })
                            ),
                            labels: {
                              rotate: -45,
                              style: { fontSize: "10px", colors: "#9ca3af" },
                              offsetY: 5,
                            },
                            axisBorder: { show: false },
                            axisTicks: { show: false },
                          },
                          yaxis: {
                            labels: {
                              formatter: (value) =>
                                `${(value / 1000).toFixed(0)}k`,
                              style: { colors: "#9ca3af" },
                            },
                          },
                          dataLabels: { enabled: false },
                          stroke: { curve: "smooth", width: 2 },
                          colors: ["#3b82f6"],
                          grid: {
                            borderColor: "hsl(var(--border))",
                            strokeDashArray: 4,
                            row: {
                              colors: ["transparent", "transparent"],
                              opacity: 0.5,
                            },
                          },
                          tooltip: {
                            theme:
                              typeof window !== "undefined" &&
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "dark"
                                : "light",
                            y: {
                              formatter: (value) =>
                                `${value.toLocaleString()} so'm`,
                            },
                          },
                          fill: {
                            type: "gradient",
                            gradient: {
                              shadeIntensity: 1,
                              opacityFrom: 0.7,
                              opacityTo: 0.3,
                              stops: [0, 90, 100],
                            },
                          },
                        }}
                        series={[
                          {
                            name: "Savdo",
                            data: validSalesData.map((day) => day.sales),
                          },
                        ]}
                        type="area"
                        height="100%"
                        width="100%"
                      />
                    </div>
                  ) : isLoadingDashboard ? (
                    <div className="flex h-[250px] items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                    </div>
                  ) : (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                      Savdo grafigi uchun ma'lumotlar topilmadi.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-full lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-base font-semibold">
                    Eng ko'p sotilganlar
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        {dateRange === "daily"
                          ? "Bugun"
                          : dateRange === "weekly"
                          ? "Haftalik"
                          : "Oylik"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDateRange("daily")}>
                        Bugun
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDateRange("weekly")}>
                        Haftalik
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDateRange("monthly")}>
                        Oylik
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[250px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mahsulot</TableHead>
                          <TableHead className="text-right">Miqdor</TableHead>
                          <TableHead className="text-right">Savdo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingTopProducts ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                            </TableCell>
                          </TableRow>
                        ) : topProductsError ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="h-24 text-center text-red-500"
                            >
                              Xatolik!
                            </TableCell>
                          </TableRow>
                        ) : validTopProducts.length > 0 ? (
                          validTopProducts.map((product, index) => (
                            <TableRow key={product.product_id || index}>
                              <TableCell className="font-medium">
                                {product.product_name || "Noma'lum"}
                              </TableCell>
                              <TableCell className="text-right">
                                {product.quantity ?? 0}
                              </TableCell>
                              <TableCell className="text-right">
                                {(product.sales ?? 0).toLocaleString()} so'm
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="h-24 text-center text-muted-foreground"
                            >
                              Bu davr uchun ma'lumot yo'q
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>So'nggi buyurtmalar</CardTitle>
                    <CardDescription>
                      Oxirgi {displayedOrders.length} ta buyurtma (
                      {validOrders.length} ta jami).
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshOrders}
                    disabled={isLoadingDashboard}
                  >
                    {isLoadingDashboard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Yangilash
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Mijoz</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Turi
                        </TableHead>
                        <TableHead className="text-right">Jami</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Holat
                        </TableHead>
                        <TableHead className="hidden lg:table-cell text-right">
                          Sana
                        </TableHead>
                        <TableHead className="text-right w-[100px]">
                          Amallar
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDashboard && displayedOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                          </TableCell>
                        </TableRow>
                      ) : displayedOrders.length > 0 ? (
                        displayedOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              #{order.id}
                            </TableCell>
                            <TableCell>
                              {order.customer_name || "Noma'lum"}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {order.order_type_display || "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              {parseFloat(
                                order.final_price || 0
                              ).toLocaleString()}{" "}
                              so'm
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                variant={
                                  order.status === "paid" ||
                                  order.status === "completed"
                                    ? "success"
                                    : order.status === "cancelled"
                                    ? "destructive"
                                    : order.status === "pending"
                                    ? "warning"
                                    : order.status === "ready"
                                    ? "info"
                                    : order.status === "preparing"
                                    ? "info"
                                    : order.status === "new"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {order.status_display || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-right">
                              {new Date(order.created_at).toLocaleString(
                                "uz-UZ",
                                { dateStyle: "short", timeStyle: "short" }
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="sr-only">Amallar</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleShowOrderDetails(order.id)
                                    }
                                  >
                                    Batafsil
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      printCustomerReceiptAPI(
                                        orders.find((o) => o.id === order.id) ||
                                          order
                                      )
                                    }
                                    disabled={
                                      !orders.find((o) => o.id === order.id)
                                    }
                                  >
                                    Mijoz chekini chiqarish
                                  </DropdownMenuItem>
                                  {(order.status === "pending" ||
                                    order.status === "processing" ||
                                    order.status === "ready" ||
                                    order.status === "new" ||
                                    order.status === "preparing") && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (
                                          confirm(
                                            `Haqiqatan ham #${order.id} raqamli buyurtmani bekor qilmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`
                                          )
                                        ) {
                                          handleCancelOrder(order.id);
                                        }
                                      }}
                                      className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Bekor qilish
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Buyurtmalar topilmadi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-center pt-4">
                  {!showAllOrders && validOrders.length > 5 && (
                    <Button
                      variant="link"
                      onClick={() => setShowAllOrders(true)}
                    >
                      Barchasini ko'rish ({validOrders.length})
                    </Button>
                  )}
                  {showAllOrders && (
                    <Button
                      variant="link"
                      onClick={() => setShowAllOrders(false)}
                    >
                      Kamroq ko'rish
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Buyurtmalar
                </h2>
                <Button
                  variant="ghost"
                  onClick={refreshOrders}
                  disabled={isLoadingDashboard}
                >
                  {isLoadingDashboard ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Paperclip className="mr-2 h-4 w-4" />
                  )}
                  Yangilash
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Buyurtmalar ro'yxati</CardTitle>
                  <CardDescription>
                    Barcha buyurtmalar va ularning holati.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Mijoz</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Turi
                        </TableHead>
                        <TableHead className="text-right">Jami</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Holat
                        </TableHead>
                        <TableHead className="hidden lg:table-cell text-right">
                          Sana
                        </TableHead>
                        <TableHead className="text-right w-[100px]">
                          Amallar
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDashboard && validOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                          </TableCell>
                        </TableRow>
                      ) : validOrders.length > 0 ? (
                        validOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              #{order.id}
                            </TableCell>
                            <TableCell>
                              {order.customer_name || "Noma'lum"}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {order.order_type_display || "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              {parseFloat(
                                order.final_price || 0
                              ).toLocaleString()}{" "}
                              so'm
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                variant={
                                  order.status === "paid" ||
                                  order.status === "completed"
                                    ? "success"
                                    : order.status === "cancelled"
                                    ? "destructive"
                                    : order.status === "pending"
                                    ? "warning"
                                    : order.status === "ready"
                                    ? "info"
                                    : order.status === "preparing"
                                    ? "info"
                                    : order.status === "new"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {order.status_display || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-right">
                              {new Date(order.created_at).toLocaleString(
                                "uz-UZ",
                                { dateStyle: "short", timeStyle: "short" }
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="sr-only">Amallar</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleShowOrderDetails(order.id)
                                    }
                                  >
                                    Batafsil
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      printCustomerReceiptAPI(order)
                                    }
                                    disabled={!order}
                                  >
                                    Mijoz chekini chiqarish
                                  </DropdownMenuItem>
                                  {(order.status === "pending" ||
                                    order.status === "processing" ||
                                    order.status === "ready" ||
                                    order.status === "new" ||
                                    order.status === "preparing") && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (
                                          confirm(
                                            `Haqiqatan ham #${order.id} raqamli buyurtmani bekor qilmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`
                                          )
                                        ) {
                                          handleCancelOrder(order.id);
                                        }
                                      }}
                                      className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Bekor qilish
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Buyurtmalar topilmadi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Mahsulotlar
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={refreshProducts}
                    disabled={isLoadingDashboard}
                  >
                    {isLoadingDashboard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Yangilash
                  </Button>
                  <Button onClick={() => setShowAddProductDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Yangi mahsulot qo'shish
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Mahsulotlar ro'yxati</CardTitle>
                  <CardDescription>
                    Barcha mavjud mahsulotlar va ularning narxlari.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahsulot nomi</TableHead>
                        <TableHead className="text-right">Narx</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Kategoriya
                        </TableHead>
                        <TableHead className="hidden md:table-cell text-right">
                          Tannarx
                        </TableHead>
                        <TableHead className="text-right">Holat</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDashboard && validProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                          </TableCell>
                        </TableRow>
                      ) : validProducts.length > 0 ? (
                        validProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                              <Avatar className="h-8 w-8 rounded-sm">
                                <AvatarImage
                                  src={
                                    product.image || "/placeholder-product.jpg"
                                  }
                                  alt={product.name || "Mahsulot"}
                                  className="object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder-product.jpg";
                                  }}
                                />
                                <AvatarFallback className="rounded-sm bg-muted text-muted-foreground text-xs">
                                  {(product.name || "?")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{product.name || "Noma'lum"}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              {(product.price || 0).toLocaleString()} so'm
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {product.category?.name || "N/A"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-right">
                              {(product.cost_price || 0).toLocaleString()} so'm
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  product.is_active ? "success" : "destructive"
                                }
                              >
                                {product.is_active ? "Faol" : "Faol emas"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="sr-only">Amallar</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditProductClick(product)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteProduct(product)}
                                    className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    O'chirish
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Mahsulotlar topilmadi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold tracking-tight">Xodimlar</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={refreshEmployees}
                    disabled={isLoadingDashboard}
                  >
                    {isLoadingDashboard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Yangilash
                  </Button>
                  <Button onClick={() => setShowAddEmployeeDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Yangi xodim qo'shish
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Xodimlar ro'yxati</CardTitle>
                  <CardDescription>
                    Barcha xodimlar va ularning rollari.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ism</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Username
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Rol
                        </TableHead>
                        <TableHead className="text-right">Holat</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDashboard && validXodim.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                          </TableCell>
                        </TableRow>
                      ) : validXodim.length > 0 ? (
                        validXodim.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">
                              {employee.first_name} {employee.last_name}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {employee.username || "N/A"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {translateRole(employee.role?.name)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  employee.is_active ? "success" : "destructive"
                                }
                              >
                                {employee.is_active ? "Faol" : "Faol emas"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="sr-only">Amallar</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditEmployeeClick(employee)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteEmployee(employee)
                                    }
                                    className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    O'chirish
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Xodimlar topilmadi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold tracking-tight">Rollar</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={refreshRoles}
                    disabled={isLoadingDashboard}
                  >
                    {isLoadingDashboard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Yangilash
                  </Button>
                  <Button onClick={() => setShowAddRoleDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Yangi rol qo'shish
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Rollar ro'yxati</CardTitle>
                  <CardDescription>
                    Tizimdagi barcha rollar va ularga biriktirilgan xodimlar
                    soni.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rol nomi</TableHead>
                        <TableHead className="text-right">
                          Xodimlar soni
                        </TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDashboard && validRolesList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                          </TableCell>
                        </TableRow>
                      ) : validRolesList.length > 0 ? (
                        validRolesList.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">
                              {translateRole(role.name)}
                            </TableCell>
                            <TableCell className="text-right">
                              {role.employee_count ?? 0}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="sr-only">Amallar</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditRoleClick(role)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteRole(role)}
                                    className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                                    disabled={(role.employee_count ?? 0) > 0}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    O'chirish
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Rollar topilmadi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Kategoriyalar
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={refreshCategories}
                    disabled={isLoadingDashboard}
                  >
                    {isLoadingDashboard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Yangilash
                  </Button>
                  <Button onClick={() => setShowAddCategoryDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Yangi kategoriya qo'shish
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Kategoriyalar ro'yxati</CardTitle>
                  <CardDescription>
                    Mahsulotlar guruhlanadigan barcha kategoriyalar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Kategoriya nomi</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDashboard && validCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                          </TableCell>
                        </TableRow>
                      ) : validCategories.length > 0 ? (
                        validCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">
                              {category.id}
                            </TableCell>
                            <TableCell>{category.name || "Noma'lum"}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="sr-only">Amallar</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditCategoryClick(category)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteCategoryClick(category)
                                    }
                                    className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    O'chirish
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Kategoriyalar topilmadi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "tables" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold tracking-tight">Stollar</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={refreshTables}
                    disabled={isLoadingDashboard}
                  >
                    {isLoadingDashboard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Yangilash
                  </Button>
                  <Button onClick={() => setShowAddTableDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Yangi stol qo'shish
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Stollar ro'yxati</CardTitle>
                  <CardDescription>
                    Restorandagi barcha stollar, ularning turlari va holati.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Nomi/Raqami</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Zona
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Stol Turi (Xizmat %)
                        </TableHead>
                        <TableHead className="text-right">Holati</TableHead>
                        <TableHead className="text-right w-[100px]">
                          Amallar
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDashboard && validTables.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                          </TableCell>
                        </TableRow>
                      ) : validTables.length > 0 ? (
                        validTables.map((table) => (
                          <TableRow key={table.id}>
                            <TableCell className="font-medium">
                              {table.id}
                            </TableCell>
                            <TableCell>{table.name || "Noma'lum"}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {table.zone || "N/A"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {table.table_type ? (
                                `${table.table_type.name} (${parseFloat(
                                  table.table_type.service_fee_percent || 0
                                ).toFixed(2)}%)`
                              ) : (
                                <span className="text-muted-foreground">
                                  Belgilanmagan
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  table.is_available ? "success" : "warning"
                                }
                              >
                                {table.is_available ? "Bo'sh" : "Band"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="sr-only">Amallar</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditTableClick(table)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteTableClick(table)
                                    }
                                    className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    O'chirish
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Stollar topilmadi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "table-types" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  Stol Turlari
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={refreshTableTypes}
                    disabled={isLoadingDashboard}
                  >
                    {isLoadingDashboard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Yangilash
                  </Button>
                  <Button onClick={() => setShowAddTableTypeDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Yangi stol turi qo'shish
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Stol turlari ro'yxati</CardTitle>
                  <CardDescription>
                    Restorandagi har bir stol turiga biriktirilgan xizmat haqi
                    foizlari.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Stol Turi Nomi</TableHead>
                        <TableHead className="text-right">
                          Xizmat Haqi (%)
                        </TableHead>
                        <TableHead className="text-right w-[100px]">
                          Amallar
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDashboard && validTableTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                          </TableCell>
                        </TableRow>
                      ) : validTableTypes.length > 0 ? (
                        validTableTypes.map((tableType) => (
                          <TableRow key={tableType.id}>
                            <TableCell className="font-medium">
                              {tableType.id}
                            </TableCell>
                            <TableCell>
                              {tableType.name || "Noma'lum"}
                            </TableCell>
                            <TableCell className="text-right">
                              {parseFloat(
                                tableType.service_fee_percent || 0
                              ).toFixed(2)}
                              %
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="sr-only">Amallar</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditTableTypeClick(tableType)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteTableTypeClick(tableType)
                                    }
                                    className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    O'chirish
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Stol turlari topilmadi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Hisobotlar</h2>
              <Tabs defaultValue="employees" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="employees">Xodimlar bo'yicha</TabsTrigger>
                  <TabsTrigger value="products">
                    Mahsulotlar bo'yicha
                  </TabsTrigger>
                  <TabsTrigger value="customers">Mijozlar bo'yicha</TabsTrigger>
                  <TabsTrigger value="charts">Diagrammalar</TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Xodimlar bo'yicha hisobot</CardTitle>
                      <CardDescription>
                        Xodimlarning faoliyati va savdo ko'rsatkichlari.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Xodim</TableHead>
                            <TableHead className="text-right">
                              Buyurtmalar soni
                            </TableHead>
                            <TableHead className="text-right">
                              Umumiy savdo
                            </TableHead>
                            <TableHead className="text-right hidden md:table-cell">
                              O'rtacha chek
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingDashboard &&
                          validEmployeeReport.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-24 text-center"
                              >
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                              </TableCell>
                            </TableRow>
                          ) : validEmployeeReport.length > 0 ? (
                            validEmployeeReport.map((report, index) => (
                              <TableRow key={report.employee_id || index}>
                                <TableCell className="font-medium">
                                  {report.employee_name || "Noma'lum"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {report.orders_count ?? 0}
                                </TableCell>
                                <TableCell className="text-right">
                                  {(report.total_sales ?? 0).toLocaleString()}{" "}
                                  so'm
                                </TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                  {(report.average_check ?? 0).toLocaleString()}{" "}
                                  so'm
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                              >
                                Hisobot ma'lumotlari topilmadi.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mahsulotlar bo'yicha hisobot</CardTitle>
                      <CardDescription>
                        Mahsulotlarning sotilish statistikasi.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mahsulot</TableHead>
                            <TableHead className="text-right">
                              Sotilgan miqdor
                            </TableHead>
                            <TableHead className="text-right">
                              Umumiy savdo
                            </TableHead>
                            <TableHead className="text-right hidden md:table-cell">
                              Foyda (taxminiy)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingDashboard &&
                          validProductReportData.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-24 text-center"
                              >
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                              </TableCell>
                            </TableRow>
                          ) : validProductReportData.length > 0 ? (
                            validProductReportData.map((product, index) => (
                              <TableRow key={product.product_id || index}>
                                <TableCell className="font-medium">
                                  {product.product_name || "Noma'lum"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {product.sold_quantity ?? 0}
                                </TableCell>
                                <TableCell className="text-right">
                                  {(
                                    product.sales_revenue ?? 0
                                  ).toLocaleString()}{" "}
                                  so'm
                                </TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                  {(product.profit ?? 0).toLocaleString()} so'm
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                              >
                                Hisobot ma'lumotlari topilmadi.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mijozlar bo'yicha hisobot</CardTitle>
                      <CardDescription>
                        Mijoz turlarining buyurtmalari va xarid statistikasi.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mijoz turi</TableHead>
                            <TableHead className="text-right">
                              Buyurtmalar soni
                            </TableHead>
                            <TableHead className="text-right">
                              Umumiy xarid
                            </TableHead>
                            <TableHead className="text-right hidden md:table-cell">
                              O'rtacha chek
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingDashboard &&
                          validCustomerReport.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-24 text-center"
                              >
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                              </TableCell>
                            </TableRow>
                          ) : validCustomerReport.length > 0 ? (
                            validCustomerReport.map((report, index) => (
                              <TableRow
                                key={
                                  report.customer_type
                                    ? report.customer_type + index
                                    : index
                                }
                              >
                                <TableCell className="font-medium">
                                  {report.customer_type || "Noma'lum"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {report.orders_count ?? 0}
                                </TableCell>
                                <TableCell className="text-right">
                                  {(report.total_sales ?? 0).toLocaleString()}{" "}
                                  so'm
                                </TableCell>
                                <TableCell className="text-right hidden md:table-cell">
                                  {(report.average_check ?? 0).toLocaleString()}{" "}
                                  so'm
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                              >
                                Mijozlar bo'yicha hisobot ma'lumotlari
                                topilmadi.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="charts" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>To'lov usullari bo'yicha</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingDashboard &&
                        validPaymentMethods.length === 0 ? (
                          <div className="flex h-[300px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                          </div>
                        ) : isClient && validPaymentMethods.length > 0 ? (
                          <div className="h-[300px] w-full">
                            <Chart
                              options={{
                                chart: {
                                  type: "pie",
                                  background: "transparent",
                                },
                                theme: {
                                  mode:
                                    typeof window !== "undefined" &&
                                    document.documentElement.classList.contains(
                                      "dark"
                                    )
                                      ? "dark"
                                      : "light",
                                },
                                labels: validPaymentMethods.map(
                                  (method) =>
                                    method.method_display || "Noma'lum"
                                ),
                                colors: [
                                  "#3b82f6",
                                  "#10b981",
                                  "#f59e0b",
                                  "#ef4444",
                                  "#8b5cf6",
                                  "#f472b6",
                                  "#6b7280",
                                ],
                                legend: {
                                  position: "bottom",
                                  labels: { colors: "#9ca3af" },
                                },
                                tooltip: {
                                  theme:
                                    typeof window !== "undefined" &&
                                    document.documentElement.classList.contains(
                                      "dark"
                                    )
                                      ? "dark"
                                      : "light",
                                  y: {
                                    formatter: (value) =>
                                      `${value} ta buyurtma`,
                                  },
                                },
                                dataLabels: {
                                  enabled: true,
                                  formatter: (val, opts) => {
                                    const name =
                                      opts.w.globals.labels[opts.seriesIndex];
                                    return val > 7
                                      ? `${name}: ${val.toFixed(1)}%`
                                      : `${val.toFixed(1)}%`;
                                  },
                                  style: {
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    colors: ["#fff"],
                                  },
                                  dropShadow: {
                                    enabled: true,
                                    top: 1,
                                    left: 1,
                                    blur: 1,
                                    color: "#000",
                                    opacity: 0.45,
                                  },
                                },
                              }}
                              series={validPaymentMethods.map(
                                (method) => method.count || 0
                              )}
                              type="pie"
                              height="100%"
                              width="100%"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                            To'lov usullari bo'yicha ma'lumot yo'q.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Buyurtma turlari bo'yicha</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingDashboard && validOrderTypes.length === 0 ? (
                          <div className="flex h-[300px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                          </div>
                        ) : isClient && validOrderTypes.length > 0 ? (
                          <div className="h-[300px] w-full">
                            <Chart
                              options={{
                                chart: {
                                  type: "donut",
                                  background: "transparent",
                                },
                                theme: {
                                  mode:
                                    typeof window !== "undefined" &&
                                    document.documentElement.classList.contains(
                                      "dark"
                                    )
                                      ? "dark"
                                      : "light",
                                },
                                labels: validOrderTypes.map(
                                  (type) => type.type_display || "Noma'lum"
                                ),
                                colors: [
                                  "#10b981",
                                  "#f59e0b",
                                  "#3b82f6",
                                  "#ef4444",
                                  "#8b5cf6",
                                  "#f472b6",
                                  "#6b7280",
                                ],
                                legend: {
                                  position: "bottom",
                                  labels: { colors: "#9ca3af" },
                                },
                                tooltip: {
                                  theme:
                                    typeof window !== "undefined" &&
                                    document.documentElement.classList.contains(
                                      "dark"
                                    )
                                      ? "dark"
                                      : "light",
                                  y: {
                                    formatter: (value) =>
                                      `${value} ta buyurtma`,
                                  },
                                },
                                dataLabels: {
                                  enabled: true,
                                  formatter: (val, opts) => {
                                    const name =
                                      opts.w.globals.labels[opts.seriesIndex];
                                    return val > 7
                                      ? `${name}: ${val.toFixed(1)}%`
                                      : `${val.toFixed(1)}%`;
                                  },
                                  style: {
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    colors: ["#fff"],
                                  },
                                  dropShadow: {
                                    enabled: true,
                                    top: 1,
                                    left: 1,
                                    blur: 1,
                                    color: "#000",
                                    opacity: 0.45,
                                  },
                                },
                              }}
                              series={validOrderTypes.map(
                                (type) => type.count || 0
                              )}
                              type="donut"
                              height="100%"
                              width="100%"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                            Buyurtma turlari bo'yicha ma'lumot yo'q.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Sozlamalar</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Restoran sozlamalari</CardTitle>
                  <CardDescription>
                    Restoran ma'lumotlarini bu yerda o'zgartirishingiz mumkin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSettings ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    </div>
                  ) : settingsError ? (
                    <div className="py-10 text-center text-red-600 dark:text-red-400">
                      Sozlamalarni yuklashda xatolik yuz berdi.
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => refetchSettings()}
                      >
                        Qayta urinish
                      </Button>
                    </div>
                  ) : settings ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateSettings();
                      }}
                      className="space-y-6"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="settings-name">Restoran nomi*</Label>
                          <Input
                            id="settings-name"
                            value={settings.name || ""}
                            onChange={(e) =>
                              updateLocalSettings({ name: e.target.value })
                            }
                            placeholder="Restoran nomi"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="settings-description">Tavsif</Label>
                          <Input
                            id="settings-description"
                            value={settings.description || ""}
                            onChange={(e) =>
                              updateLocalSettings({
                                description: e.target.value,
                              })
                            }
                            placeholder="Qisqacha tavsif"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="settings-address">Manzil</Label>
                        <Input
                          id="settings-address"
                          value={settings.address || ""}
                          onChange={(e) =>
                            updateLocalSettings({ address: e.target.value })
                          }
                          placeholder="Manzil"
                          maxLength={100}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="settings-phone">Telefon raqami</Label>
                          <Input
                            id="settings-phone"
                            value={settings.phone || ""}
                            onChange={(e) =>
                              updateLocalSettings({ phone: e.target.value })
                            }
                            placeholder="+998 XX XXX XX XX"
                            maxLength={20}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="settings-email">Email</Label>
                          <Input
                            id="settings-email"
                            type="email"
                            value={settings.email || ""}
                            onChange={(e) =>
                              updateLocalSettings({ email: e.target.value })
                            }
                            placeholder="info@example.com"
                            maxLength={254}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="settings-currency_symbol">
                            Valyuta belgisi
                          </Label>
                          <Input
                            id="settings-currency_symbol"
                            value={settings.currency_symbol || ""}
                            onChange={(e) =>
                              updateLocalSettings({
                                currency_symbol: e.target.value,
                              })
                            }
                            placeholder="so'm"
                            maxLength={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="settings-tax_percent">
                            Soliq stavkasi (%)
                          </Label>
                          <Input
                            id="settings-tax_percent"
                            type="number"
                            value={settings.tax_percent ?? ""}
                            onChange={(e) =>
                              updateLocalSettings({
                                tax_percent:
                                  e.target.value === ""
                                    ? null
                                    : parseFloat(e.target.value),
                              })
                            }
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="settings-service_fee_percent">
                            Global Xizmat Haqi (%) (eski)
                          </Label>
                          <Input
                            id="settings-service_fee_percent"
                            type="number"
                            value={settings.service_fee_percent ?? ""}
                            onChange={(e) =>
                              updateLocalSettings({
                                service_fee_percent:
                                  e.target.value === ""
                                    ? null
                                    : parseFloat(e.target.value),
                              })
                            }
                            placeholder="10"
                            min="0"
                            max="100"
                            step="0.1"
                            title="Bu global sozlama, xizmat haqi endi asosan stol turiga qarab belgilanadi."
                          />
                          <p className="text-xs text-muted-foreground">
                            Eslatma: Xizmat haqi endi asosan stol turiga qarab
                            belgilanadi.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit">Saqlash</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      Sozlamalar mavjud emas.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <Dialog
        open={showAddEmployeeDialog}
        onOpenChange={setShowAddEmployeeDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddEmployee();
            }}
          >
            <DialogHeader>
              <DialogTitle>Yangi xodim qo'shish</DialogTitle>
              <DialogDescription>
                Xodim ma'lumotlarini kiriting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-username" className="text-right">
                  Username*
                </Label>
                <Input
                  id="add-username"
                  value={newEmployee.username}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, username: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Username"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-first_name" className="text-right">
                  Ism*
                </Label>
                <Input
                  id="add-first_name"
                  value={newEmployee.first_name}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      first_name: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Ism"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-last_name" className="text-right">
                  Familiya*
                </Label>
                <Input
                  id="add-last_name"
                  value={newEmployee.last_name}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      last_name: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Familiya"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-role_id" className="text-right">
                  Rol*
                </Label>
                <Select
                  value={newEmployee.role_id}
                  onValueChange={(value) =>
                    setNewEmployee({ ...newEmployee, role_id: value })
                  }
                  required
                >
                  <SelectTrigger className="col-span-3" id="add-role_id">
                    <SelectValue placeholder="Rolni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {validFetchedRoles.length > 0 ? (
                      validFetchedRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {translateRole(role.name)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Rollar topilmadi
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-pin_code" className="text-right">
                  PIN-kod*
                </Label>
                <Input
                  id="add-pin_code"
                  type="password"
                  pattern="\d{4}"
                  value={newEmployee.pin_code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setNewEmployee({ ...newEmployee, pin_code: value });
                  }}
                  className="col-span-3"
                  placeholder="4 raqamli PIN"
                  maxLength={4}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-is_active" className="text-right">
                  Faol
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="add-is_active"
                    checked={newEmployee.is_active}
                    onCheckedChange={(checked) =>
                      setNewEmployee({ ...newEmployee, is_active: checked })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddEmployeeDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit">Qo'shish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditEmployeeDialog}
        onOpenChange={setShowEditEmployeeDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateEmployee();
            }}
          >
            <DialogHeader>
              <DialogTitle>Xodimni tahrirlash</DialogTitle>
              <DialogDescription>
                Xodim ma'lumotlarini o'zgartiring. PIN-kodni yangilash majburiy.
              </DialogDescription>
            </DialogHeader>
            {isLoadingEmployeeDetails ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              </div>
            ) : editingEmployee ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-username" className="text-right">
                    Username*
                  </Label>
                  <Input
                    id="edit-username"
                    value={editingEmployee.username || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        username: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Username"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-first_name" className="text-right">
                    Ism*
                  </Label>
                  <Input
                    id="edit-first_name"
                    value={editingEmployee.first_name || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        first_name: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Ism"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-last_name" className="text-right">
                    Familiya*
                  </Label>
                  <Input
                    id="edit-last_name"
                    value={editingEmployee.last_name || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        last_name: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Familiya"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role_id" className="text-right">
                    Rol*
                  </Label>
                  <Select
                    value={editingEmployee.role_id?.toString() || ""}
                    onValueChange={(value) =>
                      setEditingEmployee({ ...editingEmployee, role_id: value })
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3" id="edit-role_id">
                      <SelectValue placeholder="Rolni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {validFetchedRoles.length > 0 ? (
                        validFetchedRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {translateRole(role.name)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Rollar topilmadi
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-pin_code" className="text-right">
                    Yangi PIN*
                  </Label>
                  <Input
                    id="edit-pin_code"
                    type="password"
                    pattern="\d{4}"
                    value={editingEmployee.pin_code || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setEditingEmployee({
                        ...editingEmployee,
                        pin_code: value,
                      });
                    }}
                    className="col-span-3"
                    placeholder="Yangi 4 raqamli PIN"
                    maxLength={4}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-is_active" className="text-right">
                    Faol
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Switch
                      id="edit-is_active"
                      checked={editingEmployee.is_active}
                      onCheckedChange={(checked) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          is_active: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Xodim ma'lumotlari topilmadi.
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditEmployeeDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isLoadingEmployeeDetails || !editingEmployee}
              >
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddRole();
            }}
          >
            <DialogHeader>
              <DialogTitle>Yangi rol qo'shish</DialogTitle>
              <DialogDescription>
                Rol nomini kiriting (masalan: Oshpaz, Ofitsiant, Kassir).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role_name" className="text-right">
                  Rol nomi*
                </Label>
                <Input
                  id="role_name"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Masalan: Kassir"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddRoleDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit">Qo'shish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteRoleConfirmOpen}
        onOpenChange={setIsDeleteRoleConfirmOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rolni o'chirishni tasdiqlang</DialogTitle>
            <DialogDescription>
              Haqiqatan ham{" "}
              <strong>"{translateRole(roleToDelete?.name)}"</strong> rolini
              o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
              {roleToDelete?.employee_count > 0 && (
                <span className="block mt-2 text-red-600 dark:text-red-400 font-semibold">
                  Diqqat: Bu rolga {roleToDelete.employee_count} ta xodim
                  biriktirilgan. Rolni o'chirish uchun avval xodimlarni boshqa
                  rolga o'tkazing yoki xodimlarni o'chiring.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteRoleConfirmOpen(false);
                setRoleToDelete(null);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteRole}
              disabled={roleToDelete?.employee_count > 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddProductDialog}
        onOpenChange={setShowAddProductDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddProduct();
            }}
          >
            <DialogHeader>
              <DialogTitle>Yangi mahsulot qo'shish</DialogTitle>
              <DialogDescription>
                Mahsulot ma'lumotlarini kiriting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product_name" className="text-right">
                  Nomi*
                </Label>
                <Input
                  id="product_name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Masalan: Osh"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Narx*
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Narx (so'mda)"
                  min="0"
                  step="100"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost_price" className="text-right">
                  Tannarx
                </Label>
                <Input
                  id="cost_price"
                  type="number"
                  value={newProduct.cost_price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, cost_price: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Tannarx (ixtiyoriy)"
                  min="0"
                  step="100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category_id" className="text-right">
                  Kategoriya*
                </Label>
                <Select
                  value={newProduct.category_id}
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, category_id: value })
                  }
                  required
                >
                  <SelectTrigger className="col-span-3" id="category_id">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {validCategories.length > 0 ? (
                      validCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name || "Noma'lum"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Kategoriyalar yo'q
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Tavsif
                </Label>
                <Input
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Mahsulot haqida qisqacha"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Rasm
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      image: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className="col-span-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product_is_active_add" className="text-right">
                  Faol
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="product_is_active_add"
                    checked={newProduct.is_active}
                    onCheckedChange={(checked) =>
                      setNewProduct({ ...newProduct, is_active: checked })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddProductDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit">Qo'shish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditProductDialog}
        onOpenChange={setShowEditProductDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProduct();
            }}
          >
            <DialogHeader>
              <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
              <DialogDescription>
                Mahsulot ma'lumotlarini o'zgartiring.
              </DialogDescription>
            </DialogHeader>
            {isLoadingProductDetails ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              </div>
            ) : editingProduct ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-product_name" className="text-right">
                    Nomi*
                  </Label>
                  <Input
                    id="edit-product_name"
                    value={editingProduct.name || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Masalan: Osh"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-price" className="text-right">
                    Narx*
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Narx (so'mda)"
                    min="0"
                    step="100"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-cost_price" className="text-right">
                    Tannarx
                  </Label>
                  <Input
                    id="edit-cost_price"
                    type="number"
                    value={editingProduct.cost_price || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        cost_price: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Tannarx (ixtiyoriy)"
                    min="0"
                    step="100"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category_id" className="text-right">
                    Kategoriya*
                  </Label>
                  <Select
                    value={editingProduct.category_id || ""}
                    onValueChange={(value) =>
                      setEditingProduct({
                        ...editingProduct,
                        category_id: value,
                      })
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3" id="edit-category_id">
                      <SelectValue placeholder="Kategoriyani tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {validCategories.length > 0 ? (
                        validCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name || "Noma'lum"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Kategoriyalar yo'q
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Tavsif
                  </Label>
                  <Input
                    id="edit-description"
                    value={editingProduct.description || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Mahsulot haqida qisqacha"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-image" className="text-right">
                    Rasm
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {editingProduct.image &&
                      typeof editingProduct.image === "string" && (
                        <Avatar className="h-16 w-16 rounded-md">
                          <AvatarImage
                            src={editingProduct.image}
                            alt="Mavjud rasm"
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-md bg-muted">
                            ?
                          </AvatarFallback>
                        </Avatar>
                      )}
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        setEditingProduct({
                          ...editingProduct,
                          newImage: file,
                        });
                      }}
                      className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Yangi rasm tanlang (ixtiyoriy).
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-product_is_active"
                    className="text-right"
                  >
                    Faol
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Switch
                      id="edit-product_is_active"
                      checked={editingProduct.is_active}
                      onCheckedChange={(checked) =>
                        setEditingProduct({
                          ...editingProduct,
                          is_active: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Mahsulot ma'lumotlari topilmadi.
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditProductDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoadingProductDetails ||
                  isUpdatingProduct ||
                  !editingProduct
                }
              >
                {isUpdatingProduct && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderDetailsModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogTitle>
              Buyurtma #{selectedOrderDetails?.id || "..."}
            </DialogTitle>
            <DialogDescription>
              Buyurtma haqida batafsil ma'lumot.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow overflow-y-auto px-6 py-4">
            {isLoadingOrderDetails ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
                <p className="ml-3 text-muted-foreground">Yuklanmoqda...</p>
              </div>
            ) : orderDetailsError ? (
              <div className="text-center text-red-600 dark:text-red-400 py-10">
                <p className="font-semibold">Xatolik!</p>
                <p>{orderDetailsError}</p>
                {selectedOrderDetails?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      handleShowOrderDetails(selectedOrderDetails.id)
                    }
                  >
                    Qayta urinish
                  </Button>
                )}
              </div>
            ) : selectedOrderDetails ? (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
                    Asosiy ma'lumotlar
                  </h3>
                  <div className="grid gap-x-4 gap-y-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">ID</p>
                      <p className="text-sm font-medium">
                        {selectedOrderDetails.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Buyurtma turi
                      </p>
                      <p className="text-sm font-medium">
                        {selectedOrderDetails.order_type_display ||
                          selectedOrderDetails.order_type ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Holat</p>
                      <Badge
                        variant={
                          selectedOrderDetails.status === "paid" ||
                          selectedOrderDetails.status === "completed"
                            ? "success"
                            : selectedOrderDetails.status === "cancelled"
                            ? "destructive"
                            : selectedOrderDetails.status === "pending"
                            ? "warning"
                            : selectedOrderDetails.status === "ready" ||
                              selectedOrderDetails.status === "preparing"
                            ? "info"
                            : selectedOrderDetails.status === "new"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-sm px-2.5 py-0.5"
                      >
                        {selectedOrderDetails.status_display ||
                          selectedOrderDetails.status ||
                          "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mijoz</p>
                      <p className="text-sm font-medium">
                        {selectedOrderDetails.customer_name || "Noma'lum"}
                      </p>
                    </div>
                    {selectedOrderDetails.customer_phone && (
                      <div>
                        <p className="text-xs text-muted-foreground">Telefon</p>
                        <p className="text-sm font-medium">
                          {selectedOrderDetails.customer_phone}
                        </p>
                      </div>
                    )}
                    {selectedOrderDetails.customer_address && (
                      <div className="lg:col-span-2">
                        <p className="text-xs text-muted-foreground">Manzil</p>
                        <p className="text-sm font-medium">
                          {selectedOrderDetails.customer_address}
                        </p>
                      </div>
                    )}
                    {selectedOrderDetails.table && (
                      <div>
                        <p className="text-xs text-muted-foreground">Stol</p>
                        <p className="text-sm font-medium">
                          {selectedOrderDetails.table.name || "Noma'lum"}
                          {selectedOrderDetails.table.zone
                            ? ` (${selectedOrderDetails.table.zone})`
                            : ""}
                          {selectedOrderDetails.table.table_type?.name
                            ? ` [${selectedOrderDetails.table.table_type.name}]`
                            : ""}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Yaratilgan vaqt
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(
                          selectedOrderDetails.created_at
                        ).toLocaleString("uz-UZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Yangilangan vaqt
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(
                          selectedOrderDetails.updated_at
                        ).toLocaleString("uz-UZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {selectedOrderDetails.created_by && (
                      <div className="lg:col-span-full">
                        <p className="text-xs text-muted-foreground">
                          Xodim (Yaratgan)
                        </p>
                        <p className="text-sm font-medium">
                          {selectedOrderDetails.created_by.first_name || ""}{" "}
                          {selectedOrderDetails.created_by.last_name || ""}
                          {selectedOrderDetails.created_by.username
                            ? ` (${selectedOrderDetails.created_by.username})`
                            : ""}
                          {selectedOrderDetails.created_by.role?.name
                            ? ` [${translateRole(
                                selectedOrderDetails.created_by.role.name
                              )}]`
                            : ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {selectedOrderDetails.payment ? (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
                        To'lov tafsilotlari
                      </h3>
                      <div className="grid gap-x-4 gap-y-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            To'lov ID
                          </p>
                          <p className="text-sm font-medium">
                            {selectedOrderDetails.payment.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            To'lov usuli
                          </p>
                          <p className="text-sm font-medium">
                            {getPaymentMethodDisplay(
                              selectedOrderDetails.payment.method
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            To'langan summa
                          </p>
                          <p className="text-sm font-medium">
                            {parseFloat(
                              selectedOrderDetails.payment.amount || 0
                            ).toLocaleString()}{" "}
                            so'm
                          </p>
                        </div>
                        {selectedOrderDetails.payment.paid_at && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              To'lov vaqti
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(
                                selectedOrderDetails.payment.paid_at
                              ).toLocaleString("uz-UZ", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}
                        {selectedOrderDetails.payment.processed_by_name && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Qabul qilgan xodim
                            </p>
                            <p className="text-sm font-medium">
                              {selectedOrderDetails.payment.processed_by_name ||
                                `(ID: ${selectedOrderDetails.payment.processed_by})`}
                            </p>
                          </div>
                        )}
                        {selectedOrderDetails.payment.received_amount !=
                          null && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Olingan summa (Naqd)
                            </p>
                            <p className="text-sm font-medium">
                              {(
                                parseFloat(
                                  selectedOrderDetails.payment.received_amount
                                ) || 0
                              ).toLocaleString()}{" "}
                              so'm
                            </p>
                          </div>
                        )}
                        {selectedOrderDetails.payment.change_amount != null && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Qaytim
                            </p>
                            <p className="text-sm font-medium">
                              {(
                                parseFloat(
                                  selectedOrderDetails.payment.change_amount
                                ) || 0
                              ).toLocaleString()}{" "}
                              so'm
                            </p>
                          </div>
                        )}
                        {selectedOrderDetails.payment.mobile_provider && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Mobil provayder
                            </p>
                            <p className="text-sm font-medium">
                              {selectedOrderDetails.payment.mobile_provider}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">
                        To'lov
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Bu buyurtma uchun to'lov ma'lumotlari mavjud emas.
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
                    Mahsulotlar
                  </h3>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50%] sm:w-[60%]">
                            Mahsulot
                          </TableHead>
                          <TableHead className="text-right w-[15%] sm:w-[10%]">
                            Miqdor
                          </TableHead>
                          <TableHead className="text-right w-[20%] sm:w-[15%]">
                            Narx
                          </TableHead>
                          <TableHead className="text-right w-[15%] sm:w-[15%]">
                            Jami
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(selectedOrderDetails.items) &&
                        selectedOrderDetails.items.length > 0 ? (
                          selectedOrderDetails.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="py-2 flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-md">
                                  <AvatarImage
                                    src={
                                      item.product_details?.image_url ||
                                      "/placeholder-product.jpg"
                                    }
                                    alt={
                                      item.product_details?.name || "Mahsulot"
                                    }
                                    className="object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "/placeholder-product.jpg";
                                    }}
                                  />
                                  <AvatarFallback className="rounded-md bg-muted text-muted-foreground text-xs">
                                    {(item.product_details?.name || "?")
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {item.product_details?.name ||
                                    `Mahsulot ID: ${item.product}` ||
                                    "Noma'lum"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right py-2">
                                {item.quantity || 0}
                              </TableCell>
                              <TableCell className="text-right py-2">
                                {parseFloat(
                                  item.unit_price || 0
                                ).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right py-2 font-medium">
                                {parseFloat(
                                  item.total_price || 0
                                ).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-16 text-center text-muted-foreground py-2"
                            >
                              Mahsulotlar topilmadi.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md space-y-2 border dark:border-slate-700">
                  <h4 className="text-base font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Hisob-kitob
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Mahsulotlar jami:
                    </span>
                    <span className="font-medium">
                      {parseFloat(
                        selectedOrderDetails.total_price || 0
                      ).toLocaleString()}{" "}
                      so'm
                    </span>
                  </div>
                  {parseFloat(
                    selectedOrderDetails.actual_service_fee_percent ||
                      selectedOrderDetails.service_fee_percent ||
                      0
                  ) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Xizmat haqi (
                        {selectedOrderDetails.actual_service_fee_percent ||
                          selectedOrderDetails.service_fee_percent ||
                          0}
                        %):
                      </span>
                      <span className="font-medium">
                        +{" "}
                        {(
                          parseFloat(selectedOrderDetails.final_price || 0) -
                          parseFloat(selectedOrderDetails.total_price || 0)
                        ).toLocaleString()}{" "}
                        so'm
                      </span>
                    </div>
                  )}
                  <Separator className="my-2 bg-slate-200 dark:bg-slate-700" />
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>Umumiy summa:</span>
                    <span>
                      {parseFloat(
                        selectedOrderDetails.final_price || 0
                      ).toLocaleString()}{" "}
                      so'm
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-10">
                Buyurtma ma'lumotlari topilmadi.
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="flex-shrink-0 pt-4 border-t flex-wrap gap-2 justify-end px-6 pb-6">
            {selectedOrderDetails && (
              <>
                <Button
                  variant="outline"
                  onClick={() => printCustomerReceiptAPI(selectedOrderDetails)}
                  disabled={isLoadingOrderDetails}
                >
                  <Printer className="mr-2 h-4 w-4" /> Mijoz chekini chiqarish
                </Button>
                {(selectedOrderDetails.status === "new" ||
                  selectedOrderDetails.status === "pending" ||
                  selectedOrderDetails.status === "preparing" ||
                  selectedOrderDetails.status === "processing") && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      printKitchenReceiptAPI(selectedOrderDetails, "initial")
                    }
                    disabled={isLoadingOrderDetails}
                  >
                    <ChefHat className="mr-2 h-4 w-4" /> Oshxona chekini
                    chiqarish
                  </Button>
                )}
              </>
            )}
            {selectedOrderDetails &&
              (selectedOrderDetails.status === "pending" ||
                selectedOrderDetails.status === "processing" ||
                selectedOrderDetails.status === "ready" ||
                selectedOrderDetails.status === "new" ||
                selectedOrderDetails.status === "preparing") && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        `Haqiqatan ham #${selectedOrderDetails.id} raqamli buyurtmani bekor qilmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`
                      )
                    ) {
                      handleCancelOrder(selectedOrderDetails.id);
                    }
                  }}
                  disabled={isLoadingOrderDetails}
                >
                  <X className="mr-2 h-4 w-4" /> Buyurtmani bekor qilish
                </Button>
              )}
            <Button variant="secondary" onClick={handleModalClose}>
              Yopish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateRole();
            }}
          >
            <DialogHeader>
              <DialogTitle>Rolni tahrirlash</DialogTitle>
              <DialogDescription>Rol nomini o'zgartiring.</DialogDescription>
            </DialogHeader>
            {isLoadingRoleDetails ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              </div>
            ) : editingRole ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role-name" className="text-right">
                    Rol nomi*
                  </Label>
                  <Input
                    id="edit-role-name"
                    value={editingRole.name || ""}
                    onChange={(e) =>
                      setEditingRole({ ...editingRole, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Rol nomi"
                    required
                    minLength={1}
                    maxLength={100}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Rol ma'lumotlari topilmadi.
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditRoleDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoadingRoleDetails ||
                  !editingRole ||
                  !editingRole.name?.trim()
                }
              >
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCategory();
            }}
          >
            <DialogHeader>
              <DialogTitle>Yangi kategoriya qo'shish</DialogTitle>
              <DialogDescription>
                Yangi mahsulot kategoriyasi nomini kiriting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category_name" className="text-right">
                  Nomi*
                </Label>
                <Input
                  id="category_name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  className="col-span-3"
                  placeholder="Masalan: Ichimliklar"
                  required
                  maxLength={100}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCategoryDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit">Qo'shish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditCategoryDialog}
        onOpenChange={setShowEditCategoryDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateCategory();
            }}
          >
            <DialogHeader>
              <DialogTitle>Kategoriyani tahrirlash</DialogTitle>
              <DialogDescription>
                Kategoriya nomini o'zgartiring.
              </DialogDescription>
            </DialogHeader>
            {editingCategory ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category-name" className="text-right">
                    Nomi*
                  </Label>
                  <Input
                    id="edit-category-name"
                    value={editingCategory.name || ""}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Kategoriya nomi"
                    required
                    maxLength={100}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Kategoriya ma'lumotlari topilmadi.
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditCategoryDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={
                  isUpdatingCategory ||
                  !editingCategory ||
                  !editingCategory.name?.trim()
                }
              >
                {isUpdatingCategory && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteCategoryConfirmDialog}
        onOpenChange={setShowDeleteCategoryConfirmDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kategoriyani o'chirishni tasdiqlang</DialogTitle>
            <DialogDescription>
              Haqiqatan ham{" "}
              <strong>"{categoryToDelete?.name || "Noma'lum"}"</strong>{" "}
              kategoriyasini o'chirishni xohlaysizmi? Bu amalni qaytarib
              bo'lmaydi.
              <span className="block mt-2 text-orange-600 dark:text-orange-400 font-medium">
                Bu kategoriyaga tegishli mahsulotlar bo'lsa, o'chirishda xatolik
                yuz berishi mumkin.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteCategoryConfirmDialog(false);
                setCategoryToDelete(null);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCategory}
              disabled={isDeletingCategory}
            >
              {isDeletingCategory && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trash2 className="mr-2 h-4 w-4" /> O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddTableDialog} onOpenChange={setShowAddTableDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddTable();
            }}
          >
            <DialogHeader>
              <DialogTitle>Yangi stol qo'shish</DialogTitle>
              <DialogDescription>
                Yangi stol nomini, zonasini, turini va holatini kiriting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-table-name" className="text-right">
                  Nomi/Raqami*
                </Label>
                <Input
                  id="add-table-name"
                  value={newTable.name}
                  onChange={(e) =>
                    setNewTable({ ...newTable, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Masalan: Stol 5 yoki VIP"
                  required
                  maxLength={50}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-table-zone" className="text-right">
                  Zona
                </Label>
                <Input
                  id="add-table-zone"
                  value={newTable.zone}
                  onChange={(e) =>
                    setNewTable({ ...newTable, zone: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Masalan: Asosiy zal, Yerto'la"
                  maxLength={50}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-table-type_id" className="text-right">
                  Stol Turi*
                </Label>
                <Select
                  value={newTable.table_type_id}
                  onValueChange={(value) =>
                    setNewTable({ ...newTable, table_type_id: value })
                  }
                  required
                >
                  <SelectTrigger className="col-span-3" id="add-table-type_id">
                    <SelectValue placeholder="Stol turini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {validTableTypes.length > 0 ? (
                      validTableTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name} (
                          {parseFloat(type.service_fee_percent).toFixed(2)}%)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Stol turlari topilmadi
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-table-is_available" className="text-right">
                  Holati (Bo'sh)
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch
                    id="add-table-is_available"
                    checked={newTable.is_available}
                    onCheckedChange={(checked) =>
                      setNewTable({ ...newTable, is_available: checked })
                    }
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({newTable.is_available ? "Bo'sh" : "Band"})
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddTableDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isAddingTable}>
                {isAddingTable && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Qo'shish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditTableDialog} onOpenChange={setShowEditTableDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTable();
            }}
          >
            <DialogHeader>
              <DialogTitle>Stolni tahrirlash</DialogTitle>
              <DialogDescription>
                Stol ma'lumotlarini o'zgartiring.
              </DialogDescription>
            </DialogHeader>
            {editingTable ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-table-name" className="text-right">
                    Nomi/Raqami*
                  </Label>
                  <Input
                    id="edit-table-name"
                    value={editingTable.name || ""}
                    onChange={(e) =>
                      setEditingTable({ ...editingTable, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Stol nomi/raqami"
                    required
                    maxLength={50}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-table-zone" className="text-right">
                    Zona
                  </Label>
                  <Input
                    id="edit-table-zone"
                    value={editingTable.zone || ""}
                    onChange={(e) =>
                      setEditingTable({ ...editingTable, zone: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Masalan: Asosiy zal"
                    maxLength={50}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-table-type_id" className="text-right">
                    Stol Turi*
                  </Label>
                  <Select
                    value={editingTable.table_type_id?.toString() || ""}
                    onValueChange={(value) =>
                      setEditingTable({ ...editingTable, table_type_id: value })
                    }
                    required
                  >
                    <SelectTrigger
                      className="col-span-3"
                      id="edit-table-type_id"
                    >
                      <SelectValue placeholder="Stol turini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {validTableTypes.length > 0 ? (
                        validTableTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name} (
                            {parseFloat(type.service_fee_percent).toFixed(2)}%)
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Stol turlari topilmadi
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-table-is_available"
                    className="text-right"
                  >
                    Holati (Bo'sh)
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Switch
                      id="edit-table-is_available"
                      checked={editingTable.is_available}
                      onCheckedChange={(checked) =>
                        setEditingTable({
                          ...editingTable,
                          is_available: checked,
                        })
                      }
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({editingTable.is_available ? "Bo'sh" : "Band"})
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Stol ma'lumotlari topilmadi.
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditTableDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isUpdatingTable || !editingTable}>
                {isUpdatingTable && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteTableConfirmDialog}
        onOpenChange={setShowDeleteTableConfirmDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Stolni o'chirishni tasdiqlang</DialogTitle>
            <DialogDescription>
              Haqiqatan ham{" "}
              <strong>"{tableToDelete?.name || "Noma'lum"}"</strong> (ID:{" "}
              {tableToDelete?.id}) stolni o'chirishni xohlaysizmi? Bu amalni
              qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteTableConfirmDialog(false);
                setTableToDelete(null);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTable}
              disabled={isDeletingTable}
            >
              {isDeletingTable && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trash2 className="mr-2 h-4 w-4" /> O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddTableTypeDialog}
        onOpenChange={setShowAddTableTypeDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddTableType();
            }}
          >
            <DialogHeader>
              <DialogTitle>Yangi stol turi qo'shish</DialogTitle>
              <DialogDescription>
                Yangi stol turi nomini va unga mos xizmat haqi foizini kiriting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-tabletype-name" className="text-right">
                  Nomi*
                </Label>
                <Input
                  id="add-tabletype-name"
                  value={newTableType.name}
                  onChange={(e) =>
                    setNewTableType({ ...newTableType, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Masalan: VIP Kabina"
                  required
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-tabletype-fee" className="text-right">
                  Xizmat Haqi (%)*
                </Label>
                <Input
                  id="add-tabletype-fee"
                  type="number"
                  value={newTableType.service_fee_percent}
                  onChange={(e) =>
                    setNewTableType({
                      ...newTableType,
                      service_fee_percent: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Masalan: 15.00"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddTableTypeDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isAddingTableType}>
                {isAddingTableType && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Qo'shish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditTableTypeDialog}
        onOpenChange={setShowEditTableTypeDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTableType();
            }}
          >
            <DialogHeader>
              <DialogTitle>Stol turini tahrirlash</DialogTitle>
              <DialogDescription>
                Stol turi ma'lumotlarini o'zgartiring.
              </DialogDescription>
            </DialogHeader>
            {editingTableType ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-tabletype-name" className="text-right">
                    Nomi*
                  </Label>
                  <Input
                    id="edit-tabletype-name"
                    value={editingTableType.name || ""}
                    onChange={(e) =>
                      setEditingTableType({
                        ...editingTableType,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Stol turi nomi"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-tabletype-fee" className="text-right">
                    Xizmat Haqi (%)*
                  </Label>
                  <Input
                    id="edit-tabletype-fee"
                    type="number"
                    value={editingTableType.service_fee_percent || ""}
                    onChange={(e) =>
                      setEditingTableType({
                        ...editingTableType,
                        service_fee_percent: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Xizmat haqi foizi"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Stol turi ma'lumotlari topilmadi.
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditTableTypeDialog(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingTableType || !editingTableType}
              >
                {isUpdatingTableType && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteTableTypeConfirmDialog}
        onOpenChange={setShowDeleteTableTypeConfirmDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Stol turini o'chirishni tasdiqlang</DialogTitle>
            <DialogDescription>
              Haqiqatan ham{" "}
              <strong>"{tableTypeToDelete?.name || "Noma'lum"}"</strong> (ID:{" "}
              {tableTypeToDelete?.id}) stol turini o'chirishni xohlaysizmi? Bu
              amalni qaytarib bo'lmaydi.
              <span className="block mt-2 text-orange-600 dark:text-orange-400 font-medium">
                Agar bu stol turiga bog'langan stollar mavjud bo'lsa,
                o'chirishda xatolik yuz berishi mumkin.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteTableTypeConfirmDialog(false);
                setTableTypeToDelete(null);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTableType}
              disabled={isDeletingTableType}
            >
              {isDeletingTableType && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trash2 className="mr-2 h-4 w-4" /> O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
