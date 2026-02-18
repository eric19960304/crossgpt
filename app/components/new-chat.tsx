import { useEffect } from "react";
import { Path } from "../constant";

import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store";

export function NewChat() {
  const chatStore = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    chatStore.newSession();
    navigate(Path.Chat);
  });

  return <div></div>;
}
