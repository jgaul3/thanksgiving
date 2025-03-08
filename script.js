document.addEventListener('DOMContentLoaded', function() {
      // Get DOM elements
      const searchInput = document.getElementById('searchInput');
      const recipeItems = document.querySelectorAll('.recipe-item');
      const favoritesSection = document.getElementById('favorites');
      const favoritesList = document.getElementById('favorites-list');

      // Load favorites from cookies
      let favorites = getFavoritesFromCookie();
      saveFavoritesToCookie();

      // Initialize UI based on stored favorites
      initializeFavorites();

      // Add event listener for search input
      searchInput.addEventListener('input', filterRecipes);

      // Add event listeners for favorite buttons
      document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);

        // Set initial state for favorite buttons
        const recipeId = btn.parentElement.dataset.recipeId;
        if (favorites.includes(recipeId)) {
          btn.classList.add('active');
        }
      });

      // Function to filter recipes based on search input
      function filterRecipes() {
        const searchTerm = searchInput.value.toLowerCase();

        recipeItems.forEach(item => {
          const recipeText = item.querySelector('.recipe-link').textContent.toLowerCase();
          if (recipeText.includes(searchTerm)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      }

      // Function to toggle favorite status
      function toggleFavorite(event) {
        const btn = event.currentTarget;
        const recipeItem = btn.parentElement;
        const recipeId = recipeItem.dataset.recipeId;
        const recipeLink = recipeItem.querySelector('.recipe-link');

        // Toggle active class on button
        btn.classList.toggle('active');

        if (btn.classList.contains('active')) {
          // Add to favorites
          if (!favorites.includes(recipeId)) {
            favorites.push(recipeId);

            // Add to favorites list in UI
            const newFavoriteItem = document.createElement('li');
            newFavoriteItem.className = 'recipe-item';
            newFavoriteItem.dataset.recipeId = recipeId;
            newFavoriteItem.innerHTML = `
              <a href="${recipeLink.href}" class="recipe-link">${recipeLink.textContent}</a>
              <button class="favorite-btn active">❤</button>
            `;
            newFavoriteItem.querySelector('.favorite-btn').addEventListener('click', toggleFavorite);
            favoritesList.appendChild(newFavoriteItem);
          }
        } else {
          // Remove from favorites
          const index = favorites.indexOf(recipeId);
          if (index > -1) {
            favorites.splice(index, 1);

            // Remove from favorites list in UI
            const favoriteItem = favoritesList.querySelector(`li[data-recipe-id="${recipeId}"]`);
            if (favoriteItem) {
              favoritesList.removeChild(favoriteItem);
            }
          }
        }

        // Update all matching recipe items (in case of duplicates)
        document.querySelectorAll(`.recipe-item[data-recipe-id="${recipeId}"]`).forEach(item => {
          item.querySelector('.favorite-btn').classList.toggle('active', favorites.includes(recipeId));
        });

        // Save updated favorites to cookie
        saveFavoritesToCookie();

        // Toggle visibility of favorites section based on whether there are any favorites
        toggleFavoritesVisibility();
      }

      // Function to initialize favorites on page load
      function initializeFavorites() {
        // Add favorite items to favorites section
        favorites.forEach(recipeId => {
          const originalItem = document.querySelector(`.recipe-item[data-recipe-id="${recipeId}"]`);
          if (originalItem) {
            const recipeLink = originalItem.querySelector('.recipe-link');

            // Create new item for favorites list
            const newFavoriteItem = document.createElement('li');
            newFavoriteItem.className = 'recipe-item';
            newFavoriteItem.dataset.recipeId = recipeId;
            newFavoriteItem.innerHTML = `
              <a href="${recipeLink.href}" class="recipe-link">${recipeLink.textContent}</a>
              <button class="favorite-btn active">❤</button>
            `;
            newFavoriteItem.querySelector('.favorite-btn').addEventListener('click', toggleFavorite);
            favoritesList.appendChild(newFavoriteItem);

            // Set active class on all original items
            document.querySelectorAll(`.recipe-item[data-recipe-id="${recipeId}"] .favorite-btn`).forEach(btn => {
              btn.classList.add('active');
            });
          }
        });

        // Toggle visibility of favorites section
        toggleFavoritesVisibility();
      }

      // Function to toggle visibility of favorites section
      function toggleFavoritesVisibility() {
        if (favoritesList.children.length > 0) {
          favoritesSection.classList.remove('hidden');
        } else {
          favoritesSection.classList.add('hidden');
        }
      }

      // Function to save favorites to cookie
      function saveFavoritesToCookie() {
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        document.cookie = `favorites=${JSON.stringify(favorites)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
      }

      // Function to get favorites from cookie
      function getFavoritesFromCookie() {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith('favorites='));

        if (cookieValue) {
          try {
            return JSON.parse(cookieValue.split('=')[1]);
          } catch (e) {
            console.error('Error parsing favorites cookie', e);
            return [];
          }
        }

        return [];
      }

      // Smooth scrolling for sidebar links
      document.querySelectorAll('.sidebar a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();

          const targetId = this.getAttribute('href').substring(1);
          const targetSection = document.getElementById(targetId);

          window.scrollTo({
            top: targetSection.offsetTop - 100, // Adjust for header
            behavior: 'smooth'
          });
        });
      });
    });