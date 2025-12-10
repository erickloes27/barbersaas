import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
    return (
        <div
            className={cn(
                "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
