import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00aaff",
      dark: "#0066cc",
      light: "#33bbff",
    },
    secondary: {
      main: "#ff6b35",
      dark: "#cc5529",
      light: "#ff8c5c",
    },
    background: {
      default: "#0a0a0a",
      paper: "#1a1a1a",
    },
    success: {
      main: "#00cc66",
    },
    error: {
      main: "#cc0066",
    },
    warning: {
      main: "#ffaa00",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: 700,
      background: "linear-gradient(45deg, #00aaff, #33bbff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: "1rem",
          fontWeight: 600,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(0, 170, 255, 0.3)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #0066cc, #00aaff)",
          "&:hover": {
            background: "linear-gradient(45deg, #0055aa, #0099ee)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(45deg, #cc5529, #ff6b35)",
          "&:hover": {
            background: "linear-gradient(45deg, #aa4422, #ee5a2e)",
          },
        },
        containedSuccess: {
          background: "linear-gradient(45deg, #00aa55, #00cc66)",
          "&:hover": {
            background: "linear-gradient(45deg, #009944, #00bb55)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(26, 26, 26, 0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
            "&:hover fieldset": {
              borderColor: "#00aaff",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00aaff",
            },
          },
        },
      },
    },
  },
});
