// app/types/page-meta.d.ts
import "vue-router";

type HeaderAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

declare module "vue-router" {
  interface RouteMeta {
    headerActions?: HeaderAction[];
  }
}

// ...your existing PageMeta augmentation stays as-is

declare module '#app'{
  interface PageMeta {
    heading?: string,
    subtext?: string,
    requiredPermission?: string
  }
}

export{}