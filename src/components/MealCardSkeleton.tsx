export default function MealCardSkeleton() {
    return (
        <div className="flex flex-col space-y-3 animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 dark:bg-zinc-700 rounded-2xl w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mt-1"></div>
        </div>
    );
}
