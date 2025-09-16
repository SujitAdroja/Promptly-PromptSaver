const input = document.getElementById("myInput");
const saveBtn = document.getElementById("saveBtn");
const form_tabs = document.querySelector(".form-tabs");
// const clearBtn = document.getElementById("clearBtn");
function openModal() {
  document.getElementById("promptModal").classList.add("show");
  if (!document.getElementById("promptForm").classList.contains("active")) {
    document.getElementById("promptForm").classList.add("active");
    document.getElementById("categoryForm").classListremove("active");
  }
}

function closeModal() {
  document.getElementById("promptModal").classList.remove("show");
  document.getElementById("promptForm").reset();
  document.getElementById("categoryForm").reset();
}

// Close modal when clicking outside
document.getElementById("promptModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    closeModal();
  }
});
document.querySelector(".fab").addEventListener("click", () => {
  openModal();
});

// Updated form submission handler with data extraction and save integration

document.getElementById("promptForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const promptText = document.getElementById("prompt").value.trim();
  const promptCategory = document
    .getElementById("prompt-category")
    .value.trim();
  const promptTag = document.getElementById("promptTag").value.trim();
  console.log(promptCategory);
  if (!promptText) {
    showNotification("Please enter a prompt text", "error");
    return;
  }

  if (!promptCategory) {
    showNotification("Please enter a category", "error");
    return;
  }
  const submitBtn = e.target.querySelector(".btn-primary");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";
  submitBtn.style.background = "var(--success)";
  submitBtn.disabled = true;

  try {
    const newPrompt = {
      value: promptText,
      tagName: promptTag,
      category: promptCategory,
      createdAt: Date.now(),
    };

    setTimeout(() => {
      submitBtn.textContent = "✓ Saved!";
      setTimeout(async () => {
        closeModal();
        submitBtn.textContent = originalText;
        submitBtn.style.background = "var(--primary)";
        submitBtn.disabled = false;
        await savePrompt(newPrompt);

        const data = await getAllPrompts();
        await loadPrompts(data);

        showNotification("Prompt saved successfully!", "success");
      }, 1000);
    }, 1500);
  } catch (error) {
    console.error("Error saving prompt:", error);

    submitBtn.textContent = originalText;
    submitBtn.style.background = "var(--primary)";
    submitBtn.disabled = false;

    showNotification("Error saving prompt. Please try again.", "error");
  }
});

document
  .querySelector("#categoryForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const categoryName = document.getElementById("category").value.trim();

    if (!categoryName) {
      showNotification("Please enter a catgeory text", "error");
      return;
    }

    const submitBtn = e.target.querySelector(".btn-primary");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Saving...";
    submitBtn.style.background = "var(--success)";
    submitBtn.disabled = true;
    try {
      setTimeout(() => {
        submitBtn.textContent = "✓ Saved!";
        setTimeout(async () => {
          closeModal();
          submitBtn.textContent = originalText;
          submitBtn.style.background = "var(--primary)";
          submitBtn.disabled = false;

          const newcat = await addCategory(categoryName);
          const container = document.querySelector(".categories-list");
          const newCategory = document.createElement("div");
          newCategory.classList.add("category");
          newCategory.setAttribute("data-category", categoryName);

          newCategory.innerHTML = `
          <div class="category-dropdown">
             <h2>${categoryName}</h2>
             <div class="category-btn-container">
             <button class="category-toggle-btn">
               <svg class="w-[12px] h-[12px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                 <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 8H4m0-2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/>
               </svg>
             </button>
             <button class="remove-category" data-id="${newcat}">-</button>
           </div>

           </div>
         `;
          const firstCategory = container.querySelector(".category");
          if (firstCategory) {
            container.insertBefore(newCategory, firstCategory);
          } else {
            container.appendChild(newCategory);
          }
          loadCategories();
          addCategoryToNew();
          showNotification("Category Added successfully!", "success");
        }, 1000);
      }, 1500);
    } catch (error) {
      console.error("Error saving prompt:", error);

      submitBtn.textContent = originalText;
      submitBtn.style.background = "var(--primary)";
      submitBtn.disabled = false;

      showNotification("Error saving prompt. Please try again.", "error");
    }
  });

async function loadPrompts(prompts, tab) {
  const categories = await getAllCategories();
  let promptList = prompts.map((p) => {
    let date = new Date(p.createdAt);
    date = date.toLocaleDateString();
    const fullText = p.text.value;
    const shortText = p.text.value.split(" ").slice(0, 6).join(" ");
    return `<div class="listItem">
        <div class="listHeader">
          <span>${p.text.tagName}</span>
          <div class="buttonsContainer">
          <div class="form-group">
                    <select class="category-select" id="promptCategory" data-id="${
                      p.id
                    }" >
                        <option class="">All</option>
                        ${categories
                          .map(
                            (
                              category
                            ) => `<option class="selectedCategory" value="${
                              category.name
                            }" data-category="${category.id}" ${
                              category.name === p.category ? "selected" : ""
                            }>${category.name}</option>
                        `
                          )
                          .join("")}
                    </select>
                </div>
            <button class="favourite ${
              p.isFavorite ? "active" : ""
            }" data-id="${p.id}">
             ${p.isFavorite ? "&#127775;" : "&#11088;"}
            </button>
            <button class="close" data-id="${p.id}">
              &times;
            </button>
          </div>
        </div>
        <p class="promptDesciption" data-full="${fullText}" data-short="${shortText}">
          ${shortText}<span class="showText" data-id="${
      p.id
    }" style="cursor:pointer; color:white;">...</span>
        </p>
        <p class="date">${date}</p>
      </div>`;
  });
  promptList = promptList.join("");
  const listEl = document.querySelector(".promptlistContainer");
  listEl.innerHTML = `<ul id="list" class="listContainer">${promptList}</ul>
`;
  document.querySelectorAll(".showText").forEach((btn) => {
    btn.addEventListener("click", function () {
      const parent = this.parentElement;
      const isExpanded = this.textContent === "...less";

      if (isExpanded) {
        parent.innerHTML =
          parent.getAttribute("data-short") +
          `<span class="showText" data-id="${btn.dataset.id}" style="cursor:pointer; color:white;">...</span>`;
      } else {
        parent.innerHTML =
          parent.getAttribute("data-full") +
          `<span class="showText" data-id="${btn.dataset.id}" style="cursor:pointer; color:white;">...less</span>`;
      }

      // reattach event listener after replacing innerHTML
      parent
        .querySelector(".showText")
        .addEventListener("click", arguments.callee);
    });
  });

  document.querySelectorAll(".category-select").forEach((selectCat) => {
    selectCat.addEventListener("click", async function (e) {
      const id = e.target.getAttribute("data-id");
      const category = e.target.value;
      await toggleCategory(+id, category);
    });
  });

  document.querySelectorAll(".close").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number(e.target.getAttribute("data-id"));
      await deletePrompt(id);
      const data = await getAllPrompts();
      await loadPrompts(data);
      showNotification("Prompt Deleted successfully!", "success");
    });
  });

  document.querySelectorAll(".favourite").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      console.log(e.target.classList.contains("active"));
      if (e.target.classList.contains("active")) {
        e.target.classList.remove("active");
        const id = Number(e.target.getAttribute("data-id"));
        await toggleFavorite(id, false);
        showNotification("Prompt Removed From Favorites", "success");
      } else {
        e.target.classList.add("active");
        const id = Number(e.target.getAttribute("data-id"));
        await toggleFavorite(id, true);
        showNotification("Prompt Added To Favorites", "success");
      }
      let data;
      document.querySelectorAll(".tab").forEach(async (tab) => {
        if (
          tab.classList.contains("active") &&
          tab.getAttribute("data-tab") === "all"
        ) {
          console.log(tab);
          data = await getAllPrompts();
        } else if (
          tab.classList.contains("active") &&
          tab.getAttribute("data-tab") === "favorites"
        ) {
          data = await getFavorites();
        }
        if (!data || data.length > 0) await loadPrompts(data);
        else {
          document.querySelector(
            ".promptlistContainer"
          ).innerHTML = `<div class="empty-state">
                        <div class="empty-icon"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                        </svg>

                        </div>
                        <h2>No Prompts Found</h2>
                        <p>Try adjusting you search terms</p>
                    </div>`;
        }
      });
    });
  });
}

// Handle category click (expand/collapse or navigate)
async function handleCategoryClick(categoryName, element) {
  const categoryItems = await getPromptsByCategory(categoryName);
  if (element.getAttribute("data-category") === categoryName) {
    const categoryList = element.querySelector(".category-items");
    if (categoryList.classList.contains("expand")) {
      console.log("expanded");
      categoryList.classList.remove("expand");
      categoryList.innerHTML = "";
    } else {
      console.log("remove expanded");
      categoryList.classList.add("expand");
      let prompts = categoryItems
        .map((p) => {
          let date = new Date(p.createdAt);
          date = date.toLocaleDateString();
          return `<div class="categoryListItem">
        <div class="listHeader">
          <span>${p.text.tagName}</span>
          <div class="buttonsContainer">
            <button class="favourite ${
              p.isFavorite ? "active" : ""
            }" data-id="${p.id}">
             ${p.isFavorite ? "&#127775;" : "&#11088;"}
            </button>
            <button class="close" data-id="${p.id}">
              &times;
            </button>
          </div>
        </div>
        <p>${p.text.value}</p>
        <div>
            
            <p class="date">${date}</p>
        </div>
      </div>`;
        })
        .join("");
      categoryList.innerHTML = prompts;
      document.querySelectorAll(".favourite").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          console.log(e.target.classList.contains("active"));
          if (e.target.classList.contains("active")) {
            e.target.classList.remove("active");
            btn.innerHTML = "&#11088;";
            const id = Number(e.target.getAttribute("data-id"));
            await toggleFavorite(id, false);
            showNotification("Removed from favorites", "success");
          } else {
            e.target.classList.add("active");
            btn.innerHTML = "&#127775;";
            const id = Number(e.target.getAttribute("data-id"));
            await toggleFavorite(id, true);
            showNotification("Added to favorites", "success");
          }
          // await loadCategories();
        });
      });
      document.querySelectorAll(".close").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = Number(e.target.getAttribute("data-id"));
          await toggleCategory(id, "");
          await loadCategories();
          showNotification("Removed from category", "success");
        });
      });
    }
  }
}

function attachCategoryEventListeners() {
  document.querySelectorAll(".category").forEach((category) => {
    category.replaceWith(category.cloneNode(true));
  });

  // Re-attach listeners to all categories
  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", async function (e) {
      console.log(e.target);
      if (e.target.classList.contains("remove-category")) {
        console.log("remove category");
        await removeCategory(+e.target.getAttribute("data-id"));
        await loadCategories();
        addCategoryToNew();
        showNotification("Category removed successfully!", "success");
      } else if (
        e.target.classList.contains("category-header") ||
        e.target.parentElement.classList.contains("category-header") ||
        e.target.closest(".category-header")
      ) {
        const button = e.target.closest(".category-toggle-btn");
        const categoryElement = e.target.closest(".category");

        if (categoryElement && !button) {
          const categoryName = categoryElement.getAttribute("data-category");
          handleCategoryClick(categoryName, categoryElement);
        }
      }
    });
  });
}
async function loadCategories() {
  try {
    const categories = await getAllCategories();
    if (!categories || categories.length <= 0) {
      document.querySelector(
        ".categories-list"
      ).innerHTML = `<div class="empty-state">
                        <div class="empty-icon"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
</svg>

</div>
                        <h2>Add New Category</h2>
                        <p>No categories found add new </p>
                    </div>`;
      return;
    }
    // Find or create the categories list container
    let categoriesListContainer = document.querySelector(".categories-list");

    // Generate categories HTML
    const categoriesHTML = categories
      .map(
        (category) => `
      <div class="category" data-category="${category.name}">
        <div class="category-dropdown category-header">  
          <h2>${category.name}</h2>
          <div class="category-btn-container">
            <button class="category-toggle-btn">
              <svg class="w-[12px] h-[12px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 8H4m0-2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/>
              </svg>
            </button>
            <button class="remove-category" data-id="${category.id}">-</button>
          </div>
        </div>
        <div class="category-items"></div>
      </div>
    `
      )
      .join("");

    // Update only the categories list
    categoriesListContainer.innerHTML = categoriesHTML;

    // Attach event listeners to the newly loaded categories
    attachCategoryEventListeners();
  } catch (error) {
    console.error("Error loading categories:", error);
    showNotification("Failed to load categories", "error");
  }
}
// Load tab content
async function loadTabContent(tab) {
  const content = document.querySelector(".promptlistContainer");
  // Add loading animation
  const favourite = await getFavorites();
  const prompts = await getAllPrompts();
  switch (tab) {
    case "all":
      await loadPrompts(prompts);
      break;
    case "favorites":
      // showNotification("Showing favorite prompts", "info");
      if (favourite && favourite.length > 0) await loadPrompts(favourite);
      else {
        document.querySelector(
          ".promptlistContainer"
        ).innerHTML = `<div class="empty-state">
                        <div class="empty-icon"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                          </svg>

                        </div>
                        <h2>No prompts found</h2>
                        <p>Try adding some prompts</p>
                    </div>`;
      }
      break;

    case "categories":
      content.innerHTML = `
      <div class="categories-list"></div>
      `;

      await loadCategories();
      attachCategoryEventListeners();
      break;
  }

  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", function (e) {
      if (e.target.closest(".category")) {
      }
    });
  });
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const tabType = tab.dataset.tab;
    loadTabContent(tabType);
  });
});

let searchTimeout;
input.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const query = await searchPrompts(e.target.value.toLowerCase());
    console.log(e.target.value);
    if (e.target.value === "") {
      document.querySelectorAll(".tab").forEach(async (tab) => {
        if (
          tab.classList.contains("active") &&
          tab.getAttribute("data-tab") === "all"
        ) {
          await loadTabContent("all");
        } else if (
          tab.classList.contains("active") &&
          tab.getAttribute("data-tab") === "favorites"
        ) {
          const favorites = await getFavorites();
          await loadTabContent("favorites");
        } else if (
          tab.classList.contains("active") &&
          tab.getAttribute("data-tab") === "categories"
        ) {
          // const categories = await getAllCategories();
          await loadTabContent("categories");
        }
      });
    } else {
      await loadPrompts(query);
    }
  }, 500);
});

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${
                  type === "success"
                    ? "var(--success)"
                    : type === "error"
                    ? "var(--error)"
                    : "var(--primary)"
                };
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 1001;
                animation: slideInFromRight 0.3s ease;
                max-width: 300px;
            `;

  const style = document.createElement("style");
  style.textContent = `
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
  document.head.appendChild(style);

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideInFromRight 0.3s ease reverse";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

async function addCategoryToNew() {
  const categories = await getAllCategories();
  const categorieshtml = categories
    .map(
      (category) =>
        `<option value="${category.name}" class="selectedCategory">${category.name}</option>`
    )
    .join("");
  let categoryContainer = document.querySelector(".promptCategorySelection");
  categoryContainer.innerHTML = `<option value="all" class="selectedCategory">All</option> ${categorieshtml}`;
}

async function changeTheme() {
  function addDark() {
    document.body.classList.add("dark");
    document.querySelector(".moon").style = "display:none";
    document.querySelector(".sun").style = "display:block";
  }

  function removeDark() {
    document.body.classList.remove("dark");
    document.querySelector(".sun").style = "display:none";
    document.querySelector(".moon").style = "display:block";
  }
  const data = await getTheme();
  if (data.dark === true) {
    addDark();
  } else {
    removeDark();
  }
  document
    .querySelector(".theme-button")
    .addEventListener("click", async function (e) {
      if (e.target.closest(".button-theme").classList.contains("moon")) {
        const theme = await saveTheme(true);
        addDark();
      } else if (e.target.closest(".button-theme").classList.contains("sun")) {
        const theme = await saveTheme(false);
        removeDark();
      }
    });
}

function init() {
  addCategoryToNew();
  loadTabContent("all");
  changeTheme();
  form_tabs.addEventListener("click", function (e) {
    console.log(e.target);
    const category = document.querySelector(".form-tab-category");
    const prompt = document.querySelector(".from-tab-prompt");
    if (e.target.textContent === "Prompt") {
      category.classList.remove("active");
      if (!prompt.classList.contains("active")) {
        prompt.classList.add("active");
        document.querySelector("#categoryForm").style = "display:none";
        document.querySelector("#promptForm").style = "display:block";
      }
    } else if (e.target.textContent === "Category") {
      prompt.classList.remove("active");
      if (!category.classList.contains("active")) {
        category.classList.add("active");
        document.querySelector("#promptForm").style = "display:none";
        document.querySelector("#categoryForm").style = "display:block";
      }
    }
  });
}

init();
