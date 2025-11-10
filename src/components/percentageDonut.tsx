import type React from "react"

interface SlimPercentageDonutProps {
  percentage: number
  size?: number
  strokeWidth?: number
  backgroundColor?: string
  foregroundColor?: string
}

export const PercentageDonut: React.FC<SlimPercentageDonutProps> = ({
  percentage,
  size = 100,
  strokeWidth = 4,
  backgroundColor = "#e5e7eb",
  foregroundColor = "#3b82f6",
}) => {
  const radius = (size - strokeWidth) / 5
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={backgroundColor} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={foregroundColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute text-xs font-medium">{Math.round(percentage)}%</div>
    </div>
  )
}

