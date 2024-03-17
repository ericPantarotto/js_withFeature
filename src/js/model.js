import { API_URL, MY_KEY, RESULTS_PER_PAGE, SPOONAKULAR_KEY } from './config';
import { AJAX, externalAPICall } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
  ingredientList: [],
  ingredientData: {},
  calendarData: [
    // {
    //   id: '654db2305d02e50014840751',
    //   image_url:
    //     'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    //   title: 'super pizza',
    //   date: new Date('2024-03-25'),
    // },
    // {
    //   id: '5ed6604591c37cdc054bcd09',
    //   image_url:
    //     'https://media.istockphoto.com/id/172268801/photo/slice-of-pizza.jpg?s=2048x2048&w=is&k=20&c=clwhXTgN25LnrQryWNhZ-Mnyqz9mkyJvTN4IWHysa2A=',
    //   title: 'coliflower pizza',
    //   date: new Date('2024-03-14'),
    //   key: 'abcdefg'
    // },
  ],
};

export const getRecipie = async function (recipeID) {
  try {
    const recievedData = await AJAX(`${API_URL}${recipeID}?key=${MY_KEY}`);
    const recipeData = recievedData.data.recipe;
    state.recipe = formatRecipeObject(recipeData, recipeData.ingredients);

    if (state.bookmarks.some(bookmark => bookmark.id === state.recipe.id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (error) {
    throw error;
  }
};

export const loadSearchResults = async function (query) {
  try {
    const searchResultsData = await AJAX(
      `${API_URL}?search=${query}&key=${MY_KEY}`
    );
    state.search.query = query;
    state.search.results = searchResultsData.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        image_url: recipe.image_url,
        publisher: recipe.publisher,
        title: recipe.title,
        ...(recipe.key && { key: recipe.key }),
      };
    });
  } catch (error) {
    throw error;
  }
};

export const sortSearchResults = function (parameter, direction) {
  if (!state.search.results) return;
};

export const getSearchResultsPage = function (page = state.search.page) {
  const firstResult = (page - 1) * state.search.resultsPerPage;
  const lastResult =
    (page - 1) * state.search.resultsPerPage + state.search.resultsPerPage;
  state.search.page = page;
  return state.search.results.slice(firstResult, lastResult);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ingredient => {
    ingredient.quantity =
      ingredient.quantity * (newServings / state.recipe.servings);
  });
  state.recipe.servings = newServings;
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }
  saveBookmarks();
};

export const removeBookmark = function (id) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
  saveBookmarks();
};

export const saveBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const loadBookmarks = function () {
  if (!localStorage.getItem('bookmarks')) return;
  const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks'));
  state.bookmarks = storedBookmarks;
};

export const uploadUserRecipe = async function (userRecipeData) {
  try {
    const userQuantities = Object.entries(userRecipeData)
      .filter(entry => entry[0].includes('quantity') && entry[1] !== '')
      .map(entry => entry[1]);

    const userUnits = Object.entries(userRecipeData)
      .filter(entry => entry[0].includes('unit') && entry[1] !== '')
      .map(entry => entry[1]);

    const userDescriptions = Object.entries(userRecipeData)
      .filter(entry => entry[0].includes('description') && entry[1] !== '')
      .map(entry => entry[1]);

    const userIngredients = userQuantities
      .map(quantity => {
        const index = userQuantities.indexOf(quantity);
        const ingredient = [
          quantity,
          userUnits[index],
          userDescriptions[index],
        ];
        return ingredient;
      })
      .map(ingredientArray => {
        return {
          quantity: ingredientArray[0],
          unit: ingredientArray[1],
          description: ingredientArray[2],
        };
      });

    const userRecipe = formatRecipeObject(userRecipeData, userIngredients);
    const sentRecipe = await AJAX(`${API_URL}?key=${MY_KEY}`, userRecipe);
    state.recipe = formatRecipeObject(
      sentRecipe.data.recipe,
      sentRecipe.data.recipe.ingredients
    );
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};

const formatRecipeObject = function (data, ingridientArray) {
  const formatedObject = {
    cooking_time: +data.cookingTime || +data.cooking_time,
    id: data.id,
    image_url: data.image || data.image_url,
    ingredients: ingridientArray,
    publisher: data.publisher,
    servings: +data.servings,
    source_url: data.sourceUrl || data.source_url,
    title: data.title,
    ...(data.key && { key: data.key }),
  };
  return formatedObject;
};

export const addIngredient = function (quantity, unit, description) {
  const id = new Date().getTime();
  const ingredientObject = {
    id: id,
    quantity: quantity,
    unit: unit,
    description: description,
  };
  state.ingredientList.push(ingredientObject);
  saveList('shopingList', state.ingredientList);
};

export const saveList = function (listName, list) {
  localStorage.setItem(listName, JSON.stringify(list));
};

export const loadList = function () {
  if (!localStorage.getItem('shopingList')) return;
  const storedIngredients = JSON.parse(localStorage.getItem('shopingList'));
  state.ingredientList = storedIngredients;
};

export const removeIngredientfromList = function (id) {
  state.ingredientList = state.ingredientList.filter(
    ingredient => ingredient.id !== id
  );
  saveList('shopingList', state.ingredientList);
};

export const getNutrition = async function (quantity, unit, description) {
  try {
    const ingredientString = `${quantity} ${unit} ${description}`;
    const ingredientData = await externalAPICall(
      ingredientString,
      SPOONAKULAR_KEY
    );
    //   console.table(ingredientData[0].nutrition.caloricBreakdown);
    //   console.table(ingredientData[0].nutrition.nutrients);
    state.ingredientData.name = ingredientData[0].name;
    state.ingredientData.nutrition = ingredientData[0].nutrition;
  } catch (error) {
    throw error;
  }
};

export const clearShoppingList = function () {
  state.ingredientList = [];
  saveList('shopingList', state.ingredientList);
};

export const removeCalendarfromList = function (id) {
  state.calendarData = state.calendarData.filter(
    calendar => calendar.id !== id
  );
  saveList('calendarList', state.calendarData);
};

export const addCalendarItem = function (dt, recipe) {
  // console.log(recipe);
  const { id, image_url, title } = recipe;

  if (
    state.calendarData.some(
      cal =>
        new Date(cal.date).getDate() === new Date(dt).getDate() &&
        new Date(cal.date).getMonth() === new Date(dt).getMonth() &&
        new Date(cal.date).getYear() === new Date(dt).getYear()
    )
  )
    return;

  state.calendarData.push({
    id,
    image_url,
    title,
    dt,
    ...(recipe.key && { key: recipe.key }),
  });

  saveList('calendarList', state.calendarData);
};

export const loadCalendars = function () {
  if (!localStorage.getItem('calendarList')) return;
  state.calendarData = JSON.parse(localStorage.getItem('calendarList'));
};
