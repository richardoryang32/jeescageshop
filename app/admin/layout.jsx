import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "jeesCage. - Admin",
    description: "jeesCage. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
