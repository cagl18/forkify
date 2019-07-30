import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as listView from './views/listView';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app 
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
*/
const state = {};

/** 
* SEARCH CONTROLLER
*/
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput(); 
   
    if(query) {
        //2) New search object and add to state
        state.search = new Search(query);

        //3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //4) Search for recipes
            await state.search.getResults(); //awaiting for the promise result to return
    
            //5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    }
}); //using event delegation to change pages (displaying results and appropiate btns)

/** 
* RECIPE CONTROLLER
*/

const controlRecipe = async () => {
    //Get ID from url
    const id = window.location.hash.replace('#',''); // windows.location is the entire URL
    
    if(id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        //Create new recipe object
        state.recipe = new Recipe(id);

        try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIntegredients();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
            // console.log(state.recipe);
            
        } catch (err) {
            alert('Error processing recipe!');
        }
        
    }
};

['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));

/** 
 * LIST CONTROLLER
*/

const controlList = () => {
    // Create a new list IF there is none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach( el => {
        const item = state.list.addItem(el.count,el.unit, el.ingredient );
        listView.renderItem(item);
    });
};

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
       controlList();
    }

});

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    console.log("click has been trigger");
    // Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){

        //Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);
    // Handle the count update
    } else if(e.target.matches('.shopping__count_value')) {
        console.log("Shopping count value trigger");
        const val = parseFloat(e.target.value, 10);
        console.log(val);
        state.list.updateCount(id, val);
    }
});

window.state = state;