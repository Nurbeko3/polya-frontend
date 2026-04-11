"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";

const EMPTY_MARKER = '.data-ant-cssinjs-cache-path{content:"";}';

export function AntdRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => createCache());

  useServerInsertedHTML(() => {
    const styleText = extractStyle(cache, { plain: true, once: true });
    // Skip if nothing was collected yet (empty marker only)
    if (!styleText || styleText === EMPTY_MARKER) return null;
    return (
      <style
        id="antd-cssinjs"
        data-rc-order="prepend"
        data-rc-priority="-1000"
        dangerouslySetInnerHTML={{ __html: styleText }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
