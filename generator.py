import json
import os
import shutil


RECIPE_DIRECTORY = "recipes"
INDEX_NAME = "index.html"


def generate_index(*, category_string, section_string):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanksgiving Recipes</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Thanksgiving Recipes</h1>
    <div class="search-container">
      <input type="text" id="searchInput" placeholder="Search recipes...">
    </div>
  </header>

  <div class="container">
    <div class="sidebar">
      <h2>Categories</h2>
      <ul id="categories">
        <li><a href="#favorites">Favorites</a></li>
        {category_string}
      </ul>
    </div>

    <div class="main-content">
      <section id="favorites" class="section favorites-section">
        <h2>Favorites</h2>
        <ul id="favorites-list" class="recipe-list">
          <!-- Favorites will be added here dynamically -->
        </ul>
      </section>
      {section_string}
      <p> Built for Joe in 2025</p>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>"""


def generate_recipe_section(*, section_id, section_name, recipe_string):
    return f"""<section id="{section_id}" class="section">
<h2>{section_name}</h2>
<ul class="recipe-list">
  {recipe_string}
</ul>
</section>
"""


def generate_recipe_list_item(*, section_id, index, link_target, recipe_name):
    return f"""<li class="recipe-item" data-recipe-id="{section_id}{index}">
  <a href={link_target} class="recipe-link">{recipe_name}</a>
  <button class="favorite-btn">❤</button>
</li>
"""


def generate_recipe_page(*, recipe_name, recipe_link):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{recipe_name} - Thanksgiving Recipes</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <div class="recipe-header">
    <h1>Thanksgiving Recipes</h1>
    <a href="../{INDEX_NAME}" class="back-link">← Back to Recipes</a>
  </div>
  <iframe class="recipe-iframe" src="{recipe_link}" sandbox="allow-same-origin allow-scripts"></iframe>
</body>
</html>"""


def main():
    if os.path.exists(RECIPE_DIRECTORY):
        shutil.rmtree(RECIPE_DIRECTORY)
    os.mkdir(RECIPE_DIRECTORY)

    if os.path.exists(INDEX_NAME):
        os.remove(INDEX_NAME)

    with open("recipe_metadata.json", "r") as file:
        metadata = json.loads(file.read())

    categories = []
    sections = []
    for section in metadata["sections"]:
        categories.append(
            f'<li><a href="#{section["id"]}">{section["name"]}</a></li>'
        )
        recipes = []
        section["recipes"].sort(key=lambda x: x["title"])

        for index, recipe in enumerate(section["recipes"]):
            inner_link = recipe["link"].strip("/")
            if not inner_link:
                continue

            _other, suffix = inner_link.rsplit("/", 1)
            inner_link = f"{RECIPE_DIRECTORY}/{suffix}.html"
            with open(inner_link, "w") as recipe_file:
                recipe_file.write(
                    generate_recipe_page(
                        recipe_name=recipe["title"], recipe_link=recipe["link"]
                    )
                )

            recipes.append(
                generate_recipe_list_item(
                    section_id=section["id"],
                    index=index,
                    link_target=inner_link,
                    recipe_name=recipe["title"]
                )
            )

        recipe_string = "\n".join(recipes)

        sections.append(
            generate_recipe_section(
                section_id=section["id"],
                section_name=section["name"],
                recipe_string=recipe_string
            )
        )

    category_string = "\n".join(categories)
    section_string = "\n".join(sections)
    with open(INDEX_NAME, "w") as file:
        file.write(
            generate_index(
                category_string=category_string, section_string=section_string
            )
        )


if __name__ == "__main__":
    main()
