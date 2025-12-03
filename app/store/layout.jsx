import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "JeesCage. - Store Dashboard",
    description: "JeesCag. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
