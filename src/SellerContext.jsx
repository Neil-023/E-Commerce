import { createContext, useContext, useState, useEffect } from "react";

const SellerContext = createContext();

export function SellerProvider({ children }) {
    const [isSeller, setIsSeller] = useState(() => {
        const role = localStorage.getItem('role');
        return role === 'seller';
    });
    useEffect(() => {
        localStorage.setItem("role", isSeller ? "seller" : "buyer");
    }, [isSeller]);
    return (
        <SellerContext.Provider value={{ isSeller, setIsSeller }}>
            {children}
        </SellerContext.Provider>
    );
}

export function useSeller() {
    return useContext(SellerContext);
}
