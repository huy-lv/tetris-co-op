import { toast } from "react-toastify";

/**
 * Copy current room link to clipboard with toast notification
 */
export const copyRoomLink = async (): Promise<void> => {
  const currentUrl = window.location.href;

  if (!currentUrl.includes("/room?id=")) {
    toast.error("Không thể copy link room!");
    return;
  }

  try {
    await navigator.clipboard.writeText(currentUrl);
    toast.success(`🎉 Đã copy link mời, hãy gửi cho bạn bè nhé!`);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = currentUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    toast.success(`🎉 Đã copy link mời, hãy gửi cho bạn bè nhé!`);
  }
};
