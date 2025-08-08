import { toast } from "react-toastify";

/**
 * Copy current room link to clipboard with toast notification
 */
export const copyRoomLink = async (): Promise<void> => {
  const currentUrl = window.location.href;

  if (!currentUrl.includes("/room?id=")) {
    toast.error("Cannot copy room link!");
    return;
  }

  try {
    await navigator.clipboard.writeText(currentUrl);
    toast.success(`🎉 Room link copied! Share it with your friends!`);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = currentUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    toast.success(`🎉 Room link copied! Share it with your friends!`);
  }
};
