import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { HighlightedText } from '@/components/market/highlighted-text';
import { Typography } from '@/components/ui/typography';
import { formatMarketPrice } from '@/constants/marketProducts';
import type { SellerMaterialFamily } from '@/constants/materials-taxonomy';
import { ArrowRightIcon, ClockIcon, MarketTabIcon, SearchIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { MarketProduct } from '@/types/market';
import { cn } from '@/utils/cn';
import type { GradeSearchSuggestions } from '@/utils/grade-search';

type SearchSuggestionsProps = {
  query: string;
  suggestions: GradeSearchSuggestions;
  recentSearches: string[];
  popularMaterials: SellerMaterialFamily[];
  onSelectMaterial: (material: SellerMaterialFamily) => void;
  onSelectProduct: (product: MarketProduct) => void;
  onSelectRecent: (term: string) => void;
  onViewAll: () => void;
  onBrowseAll?: () => void;
  onClearRecent?: () => void;
  className?: string;
};

export const SearchSuggestions = memo(function SearchSuggestions({
  query,
  suggestions,
  recentSearches,
  popularMaterials,
  onSelectMaterial,
  onSelectProduct,
  onSelectRecent,
  onViewAll,
  onBrowseAll,
  onClearRecent,
  className,
}: SearchSuggestionsProps) {
  const trimmed = query.trim();
  const showIdle = trimmed.length === 0;
  const hasMatches = suggestions.materials.length > 0 || suggestions.products.length > 0;
  const hasIdleContent = recentSearches.length > 0 || popularMaterials.length > 0;

  return (
    <View
      className={cn(
        'mx-lg flex-1 overflow-hidden rounded-xl border border-brand-border bg-brand-white shadow-sm',
        className,
      )}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        className="flex-1"
      >
        {showIdle ? (
          <View className="py-sm">
            {recentSearches.length > 0 ? (
              <View className="px-md pb-sm">
                <View className="mb-sm flex-row items-center justify-between">
                  <Typography
                    variant="fieldLabel"
                    className="text-[10px] tracking-[0.8px] text-brand-muted"
                  >
                    Recent Searches
                  </Typography>
                  {onClearRecent ? (
                    <Pressable onPress={onClearRecent} hitSlop={8} accessibilityRole="button">
                      <Typography variant="link" className="text-[12px]">
                        Clear
                      </Typography>
                    </Pressable>
                  ) : null}
                </View>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {recentSearches.map((term) => (
                    <Pressable
                      key={term}
                      onPress={() => onSelectRecent(term)}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${term}`}
                      className="flex-row items-center rounded-full border border-brand-border bg-brand-surface px-md py-sm"
                    >
                      <ClockIcon size={12} color={brandColors.muted} />
                      <Typography
                        variant="caption"
                        className="ml-xs font-sans text-[12px] normal-case tracking-normal text-brand-heading"
                      >
                        {term}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {popularMaterials.length > 0 ? (
              <View className="px-md pb-sm">
                <Typography
                  variant="fieldLabel"
                  className="mb-sm text-[10px] tracking-[0.8px] text-brand-muted"
                >
                  Popular Materials
                </Typography>
                {popularMaterials.map((material) => (
                  <Pressable
                    key={material.id}
                    onPress={() => onSelectMaterial(material)}
                    accessibilityRole="button"
                    accessibilityLabel={`Browse ${material.name}`}
                    className="flex-row items-center py-sm"
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-light">
                      <Typography variant="badge" className="text-[10px] text-brand-primary">
                        {material.code.slice(0, 4)}
                      </Typography>
                    </View>
                    <View className="ml-sm min-w-0 flex-1">
                      <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
                        {material.code}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
                      >
                        {material.name} · {material.gradeCount} grades
                      </Typography>
                    </View>
                    <Typography variant="roleTitle" className="text-[12px] text-brand-primary">
                      From {formatMarketPrice(material.startingPrice)}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {!hasIdleContent ? (
              <View className="items-center px-lg py-xl">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-primary-tint">
                  <MarketTabIcon color={brandColors.primary} />
                </View>
                <Typography
                  variant="roleTitle"
                  className="mt-md text-center text-[14px] text-brand-heading"
                >
                  Search the marketplace
                </Typography>
                <Typography variant="subheading" className="mt-xs text-center text-[13px]">
                  Try PP, HDPE, PVC, a grade code, CAS, or MFI.
                </Typography>
                {onBrowseAll ? (
                  <Pressable
                    onPress={onBrowseAll}
                    accessibilityRole="button"
                    accessibilityLabel="Browse all materials"
                    className="mt-lg rounded-lg bg-brand-primary px-lg py-sm"
                  >
                    <Typography variant="button" className="text-[13px] tracking-normal">
                      Browse all materials
                    </Typography>
                  </Pressable>
                ) : null}
              </View>
            ) : onBrowseAll ? (
              <Pressable
                onPress={onBrowseAll}
                accessibilityRole="button"
                accessibilityLabel="Browse all materials"
                className="mx-md mb-sm flex-row items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-md py-md"
              >
                <View className="min-w-0 flex-1">
                  <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
                    Browse all materials
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans text-[11px] normal-case tracking-normal text-brand-muted"
                  >
                    View the full catalog without a search
                  </Typography>
                </View>
                <ArrowRightIcon size={iconSizes.sm} color={brandColors.primary} />
              </Pressable>
            ) : null}
          </View>
        ) : !hasMatches ? (
          <View className="items-center px-lg py-xl">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-primary-tint">
              <SearchIcon size={iconSizes.lg} color={brandColors.primary} />
            </View>
            <Typography
              variant="roleTitle"
              className="mt-md text-center text-[14px] text-brand-heading"
            >
              No grades match “{trimmed}”
            </Typography>
            <Typography variant="subheading" className="mt-xs text-center text-[13px]">
              Try a material like PP, HDPE, or PVC — or browse the full catalog.
            </Typography>
            {onBrowseAll ? (
              <Pressable
                onPress={onBrowseAll}
                accessibilityRole="button"
                accessibilityLabel="Browse all materials"
                className="mt-lg rounded-lg bg-brand-primary px-lg py-sm"
              >
                <Typography variant="button" className="text-[13px] tracking-normal">
                  Browse all materials
                </Typography>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View className="py-sm">
            {suggestions.materials.length > 0 ? (
              <View className="px-md pb-sm">
                <Typography
                  variant="fieldLabel"
                  className="mb-xs text-[10px] tracking-[0.8px] text-brand-muted"
                >
                  Materials
                </Typography>
                {suggestions.materials.map((material) => (
                  <Pressable
                    key={material.id}
                    onPress={() => onSelectMaterial(material)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter ${material.name}`}
                    className="flex-row items-center py-sm"
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-light">
                      <Typography variant="badge" className="text-[10px] text-brand-primary">
                        {material.code.slice(0, 4)}
                      </Typography>
                    </View>
                    <View className="ml-sm min-w-0 flex-1">
                      <HighlightedText
                        text={material.code}
                        query={trimmed}
                        className="font-bold font-sans text-[14px] text-brand-heading"
                      />
                      <HighlightedText
                        text={`${material.name} · ${material.gradeCount} grades`}
                        query={trimmed}
                        className="mt-0.5 font-sans text-[11px] text-brand-muted"
                      />
                    </View>
                    <Typography variant="roleTitle" className="text-[12px] text-brand-primary">
                      From {formatMarketPrice(material.startingPrice)}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {suggestions.products.length > 0 ? (
              <View className="px-md pb-sm">
                <Typography
                  variant="fieldLabel"
                  className="mb-xs text-[10px] tracking-[0.8px] text-brand-muted"
                >
                  Related Grades
                </Typography>
                {suggestions.products.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => onSelectProduct(product)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${product.name}`}
                    className="flex-row items-center py-sm"
                  >
                    <View className="h-9 min-w-9 items-center justify-center rounded-lg bg-brand-surface px-xs">
                      <Typography variant="badge" className="text-[9px] text-brand-heading">
                        {product.grade.slice(0, 6)}
                      </Typography>
                    </View>
                    <View className="ml-sm min-w-0 flex-1">
                      <HighlightedText
                        text={product.name}
                        query={trimmed}
                        numberOfLines={1}
                        className="font-bold font-sans text-[14px] text-brand-heading"
                      />
                      <HighlightedText
                        text={[
                          product.gradeCode ?? product.grade,
                          product.materialType ?? product.category,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                        query={trimmed}
                        numberOfLines={1}
                        className="mt-0.5 font-sans text-[11px] text-brand-muted"
                      />
                    </View>
                    <View className="items-end">
                      <Typography variant="roleTitle" className="text-[13px] text-brand-primary">
                        {formatMarketPrice(product.price)}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="font-sans text-[10px] normal-case tracking-normal text-brand-muted"
                      >
                        / MT
                      </Typography>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {!showIdle && hasMatches ? (
        <Pressable
          onPress={onViewAll}
          accessibilityRole="button"
          accessibilityLabel={`View all results for ${trimmed}`}
          className="flex-row items-center justify-between border-t border-brand-border px-md py-md"
        >
          <View className="min-w-0 flex-1 flex-row items-center">
            <SearchIcon size={16} color={brandColors.primary} />
            <Typography
              variant="roleTitle"
              className="ml-sm flex-1 text-[13px] text-brand-heading"
              numberOfLines={1}
            >
              View all results for “{trimmed}”
            </Typography>
          </View>
          <View className="ml-sm flex-row items-center">
            <Typography
              variant="caption"
              className="mr-xs font-sans text-[11px] normal-case tracking-normal text-brand-muted"
            >
              {suggestions.totalProducts} {suggestions.totalProducts === 1 ? 'grade' : 'grades'}
            </Typography>
            <ArrowRightIcon size={iconSizes.sm} color={brandColors.muted} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
});
