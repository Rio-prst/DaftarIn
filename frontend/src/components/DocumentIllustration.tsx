export function DocumentIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      className={"documents-illustration " + className}
      viewBox="0 0 240 230"
      aria-hidden="true"
    >
      <circle cx="135" cy="115" r="93" fill="#F58B75" opacity=".42" />
      <path
        d="M31 169c-20-37-3-66 14-76-9 29 4 39 14 43-2-30 14-45 29-48-6 31-8 57-32 78"
        fill="#17324D"
      />
      <g transform="rotate(-12 128 110)">
        <rect x="74" y="31" width="112" height="154" rx="13" fill="#17324D" />
      </g>
      <g transform="rotate(7 131 115)">
        <rect x="77" y="40" width="112" height="154" rx="12" fill="white" />
        <rect x="95" y="61" width="39" height="8" rx="4" fill="#17324D" />
        <rect x="95" y="83" width="74" height="5" rx="2.5" fill="#D9DFDF" />
        <rect x="95" y="95" width="61" height="5" rx="2.5" fill="#D9DFDF" />
        <rect x="95" y="123" width="13" height="13" rx="3" fill="#FCE4DA" />
        <path
          d="m98 129 3 3 5-6"
          fill="none"
          stroke="#17324D"
          strokeWidth="2"
        />
        <rect x="116" y="127" width="51" height="5" rx="2.5" fill="#D9DFDF" />
        <rect x="95" y="148" width="13" height="13" rx="3" fill="#FCE4DA" />
        <rect x="116" y="152" width="42" height="5" rx="2.5" fill="#D9DFDF" />
      </g>
      <circle cx="187" cy="170" r="29" fill="#17324D" />
      <path
        d="m174 170 9 9 17-19"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M205 50v16m-8-8h16M37 58v10m-5-5h10"
        stroke="#17324D"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
