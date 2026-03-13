export default function ApplicationLogo(props) {
    const bw = 8;
    const g = 4;
    const step = bw + g;
    const base = 72;
  
    // 9-bar group — reduced heights
    const h9 = [8, 14, 22, 32, 40, 32, 22, 14, 8];
  
    // 11-bar group — reduced heights
    const h11 = [6, 11, 18, 28, 36, 44, 36, 28, 18, 11, 6];
  
    const startLeft = 8;
    const groupGap = 18;
    const startRight = startLeft + 9 * step + groupGap;
    const totalW = startRight + 11 * step - g + 8;
  
    return (
      <svg
        viewBox={`0 0 ${totalW} 80`}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {h9.map((h, i) => (
          <rect
            key={`a${i}`}
            x={startLeft + i * step}
            y={base - h}
            width={bw}
            height={h}
            rx={bw / 2}
            fill="black"
          />
        ))}
  
        {h11.map((h, i) => (
          <rect
            key={`b${i}`}
            x={startRight + i * step}
            y={base - h}
            width={bw}
            height={h}
            rx={bw / 2}
            fill="black"
          />
        ))}
      </svg>
    );
  }