import { useEffect, useState } from 'react';
import { ThemeData, apiThemeToThemeData } from '@/lib/themeTypes';
import { useDynamicFonts, initializeFontPreloading } from './useDynamicFonts';
import { themeApi } from '@/api/themes';

// Fallback theme definition
const getFallbackTheme = (): ThemeData => ({
  name: 'fallback',
  display_name: 'Fallback Theme',
  css_vars: {
    theme: {
      'font-sans': 'system-ui, sans-serif',
      'font-serif': 'Georgia, serif',
      'font-mono': 'monospace',
      'radius': '0.375rem'
    },
    light: {
      'background': 'oklch(1.0000 0 0)',
      'foreground': 'oklch(0.15 0 0)',
      'primary': 'oklch(0.6231 0.1880 259.8145)',
      'secondary': 'oklch(0.9670 0.0029 264.5419)',
      'accent': 'oklch(0.9514 0.0250 236.8242)',
      'muted': 'oklch(0.9608 0.0155 264.5380)',
      'card': 'oklch(1.0000 0 0)',
      'border': 'oklch(0.9216 0.0266 264.5312)'
    },
    dark: {
      'background': 'oklch(0.0902 0 0)',
      'foreground': 'oklch(0.9216 0.0266 264.5312)',
      'primary': 'oklch(0.6231 0.1880 259.8145)',
      'secondary': 'oklch(0.1725 0.0118 264.5419)',
      'accent': 'oklch(0.1686 0.0157 236.8242)',
      'muted': 'oklch(0.1412 0.0166 264.5380)',
      'card': 'oklch(0.0902 0 0)',
      'border': 'oklch(0.1725 0.0118 264.5419)'
    }
  }
});

export const useTheme = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic font loading based on theme variables
  const fontVariables = themeSettings?.css_vars?.theme || {};
  const { fontsReady, loadedFonts } = useDynamicFonts(fontVariables);

  useEffect(() => {
    const loadAndApplyTheme = async () => {
      const useBackendThemes = import.meta.env.VITE_USE_BACKEND_THEMES === 'true';

      // If not using backend themes, load from design-system
      if (!useBackendThemes) {
        setIsLoading(true);
        setError(null);
        const frontendTheme = import.meta.env.VITE_FRONTEND_THEME || 'vercel';
        console.log(`🎨 Loading frontend theme: ${frontendTheme} (VITE_USE_BACKEND_THEMES=false)`);

        try {
          // Dynamically import theme JSON
          const themeJson = await import(`../../../design-system/themes/${frontendTheme}.json`);

          // Convert camelCase to snake_case for ThemeData interface
          const theme: ThemeData = {
            name: themeJson.theme_name,
            display_name: themeJson.display_name,
            css_vars: {
              theme: themeJson.cssVars.theme,
              light: themeJson.cssVars.light,
              dark: themeJson.cssVars.dark,
            }
          };

          setThemeSettings(theme);

          // Initialize font preloading BEFORE applying theme
          await initializeFontPreloading(theme.css_vars.theme);

          // Apply theme to DOM
          applyThemeToDOM(theme);

          setError(null);
        } catch (err) {
          console.error(`Failed to load frontend theme "${frontendTheme}":`, err);
          console.log('🎨 Falling back to hardcoded theme');
          const fallbackTheme = getFallbackTheme();
          setThemeSettings(fallbackTheme);
          await initializeFontPreloading(fallbackTheme.css_vars.theme);
          applyThemeToDOM(fallbackTheme);
          setError('Failed to load frontend theme, using fallback');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Backend themes enabled - fetch from API
      try {
        setIsLoading(true);
        setError(null);

        // Get current theme from backend API
        const apiTheme = await themeApi.getCurrentTheme();
        const theme = apiThemeToThemeData(apiTheme);

        setThemeSettings(theme);

        // Initialize font preloading for this theme
        await initializeFontPreloading(theme.css_vars.theme);

        // Apply theme to DOM
        applyThemeToDOM(theme);

        setError(null);
      } catch (err) {
        console.error('Failed to load theme from backend:', err);

        // Fallback to a basic theme if backend fails
        const fallbackTheme: ThemeData = {
          name: 'fallback',
          display_name: 'Fallback Theme',
          css_vars: {
            theme: {
              'font-sans': 'system-ui, sans-serif',
              'font-serif': 'Georgia, serif',
              'font-mono': 'monospace',
              'radius': '0.375rem'
            },
            light: {
              'background': 'oklch(1.0000 0 0)',
              'foreground': 'oklch(0.15 0 0)',
              'primary': 'oklch(0.6231 0.1880 259.8145)',
              'secondary': 'oklch(0.9670 0.0029 264.5419)',
              'accent': 'oklch(0.9514 0.0250 236.8242)',
              'muted': 'oklch(0.9608 0.0155 264.5380)',
              'card': 'oklch(1.0000 0 0)',
              'border': 'oklch(0.9216 0.0266 264.5312)'
            },
            dark: {
              'background': 'oklch(0.0902 0 0)',
              'foreground': 'oklch(0.9216 0.0266 264.5312)',
              'primary': 'oklch(0.6231 0.1880 259.8145)',
              'secondary': 'oklch(0.1725 0.0118 264.5419)',
              'accent': 'oklch(0.1686 0.0157 236.8242)',
              'muted': 'oklch(0.1412 0.0166 264.5380)',
              'card': 'oklch(0.0902 0 0)',
              'border': 'oklch(0.1725 0.0118 264.5419)'
            }
          }
        };
        
        setThemeSettings(fallbackTheme);
        applyThemeToDOM(fallbackTheme);
        setError('Failed to load theme from backend, using fallback');
      } finally {
        setIsLoading(false);
      }
    };

    loadAndApplyTheme();
  }, []);

  // Helper function to apply theme CSS to DOM
  const applyThemeToDOM = (theme: ThemeData) => {
    const root = document.documentElement;

    // Apply theme variables (fonts, radius, etc.) as inline styles - these don't change between light/dark
    Object.entries(theme.css_vars.theme).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, String(value));
      
      // For font-size, also set the html element font-size for global scaling
      if (property === 'font-size') {
        document.documentElement.style.fontSize = String(value);
      }
    });
    
    // Create CSS rules for both light and dark mode (not inline styles)
    const themeStyleId = 'tweakcn-theme-styles';
    let themeStyleElement = document.getElementById(themeStyleId) as HTMLStyleElement;
    
    if (!themeStyleElement) {
      themeStyleElement = document.createElement('style');
      themeStyleElement.id = themeStyleId;
      document.head.appendChild(themeStyleElement);
    }
    
    // Generate CSS for both light and dark modes
    const lightCSS = `:root {
      ${Object.entries(theme.css_vars.light).map(([property, value]) => 
        `--${property}: ${value};`
      ).join('\n  ')}
    }`;
    
    const darkCSS = `.dark {
      ${Object.entries(theme.css_vars.dark).map(([property, value]) => 
        `--${property}: ${value};`
      ).join('\n  ')}
    }`;
    
    const fullCSS = lightCSS + '\n\n' + darkCSS;

    themeStyleElement.textContent = fullCSS;
  };

  const refreshTheme = async () => {
    setIsLoading(true);
    try {
      // Fetch current theme from backend
      const apiTheme = await themeApi.getCurrentTheme();
      const theme = apiThemeToThemeData(apiTheme);
      
      setThemeSettings(theme);
      
      // Re-initialize font preloading for this theme
      await initializeFontPreloading(theme.css_vars.theme);
      
      // Re-apply theme to DOM
      applyThemeToDOM(theme);
      
      setError(null);
    } catch (err) {
      console.error('Failed to refresh theme:', err);
      setError('Failed to refresh theme');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to switch themes
  const switchTheme = async (themeName: string) => {
    setIsLoading(true);
    try {
      // Set the new theme as current in backend
      await themeApi.setCurrentTheme(themeName);
      
      // Refresh to apply the new theme
      await refreshTheme();
    } catch (err) {
      console.error('Failed to switch theme:', err);
      setError('Failed to switch theme');
      setIsLoading(false);
    }
  };

  return {
    themeSettings,
    isLoading: isLoading || !fontsReady,
    error,
    refreshTheme,
    switchTheme,
    loadedFonts,
    fontsReady
  };
}; 