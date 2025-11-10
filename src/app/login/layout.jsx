
import { Roboto as FontSans } from "next/font/google"
import '@/app/globals.css'

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // You can specify the font weights you want to use
  variable: "--font-roboto", 
})

export const metadata = {
  title: "Awajahi Login Page",
  description: "Login to Awajahji",
};

export default function RootLayout({
  children,
}) {

  return (
      <div>
      {children}
      </div>
      
        
        
  );
}





