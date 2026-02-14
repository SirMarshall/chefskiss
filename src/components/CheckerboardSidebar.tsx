export default function CheckerboardSidebar() {
    return (
        <div className="hidden md:block w-14 h-full relative z-50">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            conic-gradient(
              #000 90deg, 
              #fff 90deg 180deg, 
              #000 180deg 270deg, 
              #fff 270deg
            )
          `,
                    backgroundSize: '24px 24px',
                }}
            ></div>
            <div className="absolute inset-y-0 right-0 w-[1px] bg-black/20"></div>
        </div>
    );
}
