import { ChevronLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecipes } from "@/lib/recipes/source"
import { requireSession } from "@/lib/session"

type Props = { params: Promise<{ slug: string }> }

async function findRecipe(slug: string) {
  const result = await getRecipes()
  return result.ok ? result.recipes.find((r) => r.slug === slug) : undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await findRecipe((await params).slug)
  return { title: recipe ? `${recipe.name} · Laozi` : "Recipe · Laozi" }
}

export default async function RecipePage({ params }: Props) {
  await requireSession()
  const recipe = await findRecipe((await params).slug)
  if (!recipe) notFound()

  const macros = [
    { label: "Protein", value: recipe.macros.protein_g },
    { label: "Carbs", value: recipe.macros.carbs_g },
    { label: "Fat", value: recipe.macros.fat_g },
  ]

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link
        href="/food"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "self-start",
        })}
      >
        <ChevronLeft data-icon="inline-start" />
        Recipes
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {recipe.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {recipe.kcal} kcal
          </span>{" "}
          per {recipe.serving}
        </p>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {macros.map((m) => (
          <Card key={m.label} className="gap-1 py-3 text-center">
            <div className="text-lg font-semibold tabular-nums">{m.value}g</div>
            <div className="text-xs text-muted-foreground">{m.label}</div>
          </Card>
        ))}
      </div>

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="-my-2 divide-y">
              {recipe.ingredients.map((i, idx) => (
                <li
                  key={idx}
                  className="flex items-baseline gap-4 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1">{i.item}</span>
                  <span className="whitespace-nowrap text-muted-foreground tabular-nums">
                    {i.kcal} kcal
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recipe.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {recipe.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
