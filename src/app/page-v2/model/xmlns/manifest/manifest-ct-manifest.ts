
import { KgwContentComplexTypeTextchild } from "../content/content-ct-text-child";
import { KgwManifestComplexTypeCategory } from "./manifest-ct-category";
import { KgwManifestComplexTypePage } from "./manifest-ct-page";
import { KgwManifestComplexTypeResource } from "./manifest-ct-resource";
import { KgwManifestComplexTypeTip } from "./manifest-ct-tip";

export interface KgwManifestComplexTypeManifest {
    title?: KgwContentComplexTypeTextchild;
    categories?: KgwManifestComplexTypeCategory[];
    pages?: KgwManifestComplexTypePage[];
    resources?: KgwManifestComplexTypeResource[];
    tips?: KgwManifestComplexTypeTip[];

    attributes: {
        tool?: string;
        locale?: string;
        type?: string;
        primaryColor?: string;
        primaryTextColor?: string;
        textColor?: string;
        backgroundColor?: string;
        backgroundImage?: string;
        backgroundImageAlign?: string;
        backgroundImageScaleType?: string;
        navbarColor?: string;
        navbarControlColor?: string;
        categoryLabelColor?: string;
        textScale?: number;
        dismissListeners?: string;
        controlColor?: string;
        cardBackgroundColor?: string;
    }
}
