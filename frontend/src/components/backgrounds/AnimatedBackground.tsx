import React, { useState, useEffect } from 'react';

interface AnimatedBackgroundProps {
  type: string; // filename without .svg extension
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  type,
  opacity = 0.6, // Default opacity, will be used from Home.tsx or this default
  className = '',
  children,
  style
}) => {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    const loadSvgContent = async () => {
      if (!type) return;

      const svgUrl = `/static/images/backgrounds/${type}.svg`;

      try {
        const response = await fetch(svgUrl);

        if (response.ok) {
          let content = await response.text();

          // Remove existing style attribute from SVG tag to prevent conflicts with injected styles
          content = content.replace(/<svg([^>]+)style="[^"]*"([^>]*)>/g, '<svg$1$2>');
          // Remove any inline background declarations within the SVG itself
          content = content.replace(/background:[^;\s"']*/gi, '');
          content = content.replace(/background-color:[^;\s"']*/gi, '');
          // Remove width and height attributes to prevent stretching
          content = content.replace(/\s+width="[^"]*"/g, '');
          content = content.replace(/\s+height="[^"]*"/g, '');

          // Use xMidYMid slice for cover-like behavior instead of none
          if (content.includes('preserveAspectRatio')) {
            content = content.replace(/preserveAspectRatio="[^"]*"/g, 'preserveAspectRatio="xMidYMid slice"');
          } else {
            content = content.replace('<svg', '<svg preserveAspectRatio="xMidYMid slice"');
          }

          // Replace CSS variables with actual visible colors - use split/join for reliability
          content = content.split('var(--primary)').join('rgba(100, 150, 255, 0.8)');
          content = content.split('var(--secondary)').join('rgba(150, 200, 255, 0.6)');

          setSvgContent(content);
        }
      } catch (error) {
        console.error(`AnimatedBackground error:`, error);
      }
    };

    loadSvgContent();
  }, [type]);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Animated SVG Background - Inline for animations to work */}
      {svgContent && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            opacity,
          }}
        >
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{
              __html: svgContent.replace(
                '<svg',
                '<svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); min-width: 100%; min-height: 100%; width: auto; height: auto; display: block !important; visibility: visible !important; background-color: transparent !important; overflow: visible !important;" class="w-full h-full"'
              )
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground; 