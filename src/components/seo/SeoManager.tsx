import { useEffect } from 'react';
import { SearchFilters } from '../../types/listing.ts';

interface SeoManagerProps {
  currentPath: string;
  filters?: SearchFilters;
}

export const SeoManager: React.FC<SeoManagerProps> = ({ currentPath, filters }) => {
  useEffect(() => {
    let title = 'أرضك | سوق الأراضي والمزارع الزراعية في مصر للبيع والإيجار';
    let description =
      'المنصة المصرية الأولى المتخصصة في تسويق واستثمار الأراضي الزراعية والمزارع للبيع والإيجار. تواصل مباشر مع أصحاب الأراضي وعقود مسجلة وموثقة.';

    // Dynamic SEO Titles and Descriptions based on path and filters
    if (currentPath === 'lands/beheira' || filters?.governorate === 'البحيرة') {
      if (filters?.city === 'وادي النطرون' || currentPath === 'lands/beheira/wadi-el-natrun') {
        title = 'مزارع وأراضي للبيع في وادي النطرون | منصة أرضك';
        description =
          'تصفح أفضل عروض الأراضي الزراعية والمزارع المثمرة للبيع في وادي النطرون بالبحيرة. آبار مياه عذبة، كهرباء، وطرق ممهدة بتسهيلات في السداد.';
      } else {
        title = 'أراضي زراعية للبيع والإيجار في البحيرة | منصة أرضك';
        description =
          'استكشف أحدث إعلانات الأراضي الزراعية والمزارع في محافظة البحيرة (وادي النطرون، النوبارية، حوش عيسى). عقود ملك نهائي وحيازات معتمدة.';
      }
    } else if (currentPath === 'lands/alexandria' || filters?.governorate === 'الإسكندرية') {
      title = 'أراضي زراعية ومزارع للبيع في الإسكندرية والعامرية | منصة أرضك';
      description =
        'عروض مزارع دواجن وإنتاج حيواني وأراضي زراعية للبيع والإيجار في الإسكندرية والعامرية وبرج العرب. أسعار منافسة وتواصل مباشر مع المالك.';
    } else if (currentPath === 'farms' || filters?.propertyType === 'مزرعة') {
      title = 'مزارع للبيع والإيجار في مصر | مزارع موالح ونخيل وعنابر جاهزة | أرضك';
      description =
        'دليل المزارع المتكاملة للبيع والإيجار في مصر. مزارع نخيل بارحي، موالح، استراحات، وعنابر إنتاج حيواني مجهزة بالكامل بالري الحديث والكهرباء.';
    } else if (currentPath === 'rent' || filters?.operationType === 'إيجار') {
      title = 'أراضي زراعية ومزارع للإيجار السنوي في مصر | منصة أرضك';
      description =
        'فرص استئجار أراضي زراعية ومزارع منتجة في مختلف محافظات مصر بعقود رسمية ومصادر ري دائمة نيلي وارتوازي.';
    } else if (currentPath === 'lands') {
      title = 'البحث عن أراضي زراعية ومزارع للبيع والإيجار في مصر | خريطة أرضك';
      description =
        'ابحث وتصفح آلاف الأراضي الزراعية والمزارع في مصر بالخريطة التفاعلية والفلاتر المتقدمة حسب المحافظة والمساحة ونوع المياه.';
    }

    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or update meta tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Set meta descriptions and Social cards
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'أرضك - Ardak');
    setMetaTag('property', 'og:url', window.location.href);

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);

    // 4. Inject Schema.org JSON-LD Structured Data
    const scriptId = 'ardak-seo-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://ardak.eg/#website',
          url: 'https://ardak.eg',
          name: 'أرضك | Ardak',
          description: 'سوق الأراضي والمزارع الزراعية في مصر',
          inLanguage: 'ar',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://ardak.eg/lands?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'RealEstateListing',
          '@id': `${window.location.href}#listing`,
          url: window.location.href,
          name: title,
          description: description,
          areaServed: {
            '@type': 'Country',
            name: 'Egypt',
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'الرئيسية',
              item: 'https://ardak.eg/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: filters?.governorate || 'الأراضي الزراعية',
              item: `https://ardak.eg/lands`,
            },
          ],
        },
      ],
    };

    scriptEl.textContent = JSON.stringify(schemaData);
  }, [currentPath, filters]);

  return null;
};
