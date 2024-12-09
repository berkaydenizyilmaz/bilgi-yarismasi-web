interface ErrorMessageProps {
    message: string;
    className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
    return (
        <div className={`rounded-md bg-red-50 p-4 text-sm text-red-500 ${className}`}>
            {message}
        </div>
    );
}