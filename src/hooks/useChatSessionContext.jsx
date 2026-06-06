import { useContext } from "react";
import { ChatSessionContext } from "../pages/chat/ChatSessionProvider";

export const useChatSessionContext = () => {
	const context = useContext(ChatSessionContext);
	if (!context) {
		throw new Error("useChatSessionContext must be used within ChatSessionProvider");
	}
	return context;
};
export default ChatSessionContext;
