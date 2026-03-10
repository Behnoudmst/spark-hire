"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerPage() {
  const [spec, setSpec] = useState<object | null>(null);

  useEffect(() => {
    fetch("/api/swagger")
      .then((r) => r.json())
      .then(setSpec);
  }, []);

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading API docs…</p>
      </div>
    );
  }

  return <SwaggerUI spec={spec} />;
}
