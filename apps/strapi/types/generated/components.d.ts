import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_ctas';
  info: {
    description: 'Banner with heading and button';
    displayName: 'Call to action';
    icon: 'cursor';
  };
  attributes: {
    buttonHref: Schema.Attribute.String & Schema.Attribute.Required;
    buttonLabel: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.Text;
  };
}

export interface BlocksFeature extends Struct.ComponentSchema {
  collectionName: 'components_blocks_features_items';
  info: {
    description: 'A single feature: icon glyph, title and description';
    displayName: 'Feature';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksFeatures extends Struct.ComponentSchema {
  collectionName: 'components_blocks_features';
  info: {
    description: 'A responsive grid of feature cards';
    displayName: 'Features';
    icon: 'layout-grid';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'blocks.feature', true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    subheading: Schema.Attribute.Text;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    description: 'Large heading with optional subheading, image and call to action';
    displayName: 'Hero';
    icon: 'crown';
  };
  attributes: {
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    subheading: Schema.Attribute.Text;
  };
}

export interface BlocksImageWithText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_with_texts';
  info: {
    description: 'Image next to a text column';
    displayName: 'Image with text';
    icon: 'picture';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'left'>;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    description: 'Markdown content';
    displayName: 'Rich text';
    icon: 'pencil';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface ElementsFooterItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_footer_items';
  info: {
    description: 'A titled group of links in the footer';
    displayName: 'FooterItem';
  };
  attributes: {
    links: Schema.Attribute.Component<'utilities.link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutNavbarItem extends Struct.ComponentSchema {
  collectionName: 'components_layout_navbar_items';
  info: {
    displayName: 'NavbarItem';
  };
  attributes: {
    label: Schema.Attribute.String;
    link: Schema.Attribute.Component<'utilities.link', false>;
    subItems: Schema.Attribute.Component<'utilities.link', true>;
  };
}

export interface SeoUtilitiesSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_utilities_seos';
  info: {
    description: 'Per-page metadata: title, description, social image, robots';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.Enumeration<
      ['all', 'noindex', 'noindex,nofollow']
    > &
      Schema.Attribute.DefaultTo<'all'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface UtilitiesBasicImage extends Struct.ComponentSchema {
  collectionName: 'components_utilities_basic_images';
  info: {
    displayName: 'BasicImage';
  };
  attributes: {
    alt: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
  };
}

export interface UtilitiesImageWithLink extends Struct.ComponentSchema {
  collectionName: 'components_utilities_image_with_links';
  info: {
    displayName: 'ImageWithLink';
  };
  attributes: {
    image: Schema.Attribute.Component<'utilities.basic-image', false>;
    link: Schema.Attribute.Component<'utilities.link', false>;
  };
}

export interface UtilitiesLink extends Struct.ComponentSchema {
  collectionName: 'components_utilities_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    newTab: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    type: Schema.Attribute.Enumeration<['external', 'page']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'page'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.cta': BlocksCta;
      'blocks.feature': BlocksFeature;
      'blocks.features': BlocksFeatures;
      'blocks.hero': BlocksHero;
      'blocks.image-with-text': BlocksImageWithText;
      'blocks.rich-text': BlocksRichText;
      'elements.footer-item': ElementsFooterItem;
      'layout.navbar-item': LayoutNavbarItem;
      'seo-utilities.seo': SeoUtilitiesSeo;
      'utilities.basic-image': UtilitiesBasicImage;
      'utilities.image-with-link': UtilitiesImageWithLink;
      'utilities.link': UtilitiesLink;
    }
  }
}
