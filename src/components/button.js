import React from "react";
import clsx from "clsx";

// FIX: Import Slot component from Radix UI for robust 'asChild' behavior
// NOTE: You will need to install '@radix-ui/react-slot' if you haven't already.
import { Slot } from "@radix-ui/react-slot"; 

// 1. Destructure 'asChild' from the props list.
export function Button({ 
  children, 
  className, 
  variant = "solid", 
  size = "md", 
  asChild, // <-- FIX: Destructure 'asChild' to consume it here
  ...props 
}) {
  
  // 2. Conditionally select the base component to render
  const Comp = asChild ? Slot : "button"; 
  
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200";

  const variants = {
    solid: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-blue-600 hover:bg-blue-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    // 3. Use the dynamic 'Comp' component
    <Comp className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Comp>
  );
}

// import React from "react";
// import clsx from "clsx";

// export function Button({ children, className, variant = "solid", size = "md", ...props }) {
//   const base =
//     "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200";

//   const variants = {
//     solid: "bg-blue-600 text-white hover:bg-blue-700",
//     outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
//     ghost: "text-blue-600 hover:bg-blue-100",
//   };

//   const sizes = {
//     sm: "px-3 py-1.5 text-sm",
//     md: "px-4 py-2",
//     lg: "px-6 py-3 text-lg",
//   };

//   return (
//     <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
//       {children}
//     </button>
//   );
// }
