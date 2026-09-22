import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { RoleProvider } from "./context/RoleContext";
import { WalletProvider } from "./features/wallet/WalletContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <WalletProvider>
            <RouterProvider router={router} />
          </WalletProvider>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
