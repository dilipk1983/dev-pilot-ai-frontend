import { useSearchParams } from "react-router-dom";

import Cards from "./cards/Cards";
import DatabaseCredentials from "./credentials/DatabaseCredentials";
import AiChat from "./chat/AiChat";
import Reports from "./Reports";

export default function Home(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "dashboard";

  const renderComponent = (): React.ReactElement => {
    switch (view) {
      case "ai-chat":
        return <AiChat />;
      case "reports":
        return <Reports />;
      case "database-credentials":
        return <DatabaseCredentials />;
      case "cards":
        return <Cards />;
      default:
        return <AiChat />;
    }
  };

  return renderComponent();
}