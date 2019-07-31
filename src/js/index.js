import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Like from './models/Like';
import * as likeView from './views/likeView';
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
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
            
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

/** 
 * LIKE CONTROLLER
*/

const controlLike = () => {
    if(!state.likes) state.likes = new Like();
    const currentID = state.recipe.id;
    const recipe = state.recipe

    //User has NOT yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            recipe.title,
            recipe.author,
            recipe.img
        );

        //Toggle the like button
        likeView.toggleLikeBtn(true);

        //Add like to UI list
        likeView.renderLike(newLike);

    //User HAS liked current recipe
    } else {
        // Remove like to the state
        state.likes.deleteLike(currentID);

        //Toggle the like button
        likeView.toggleLikeBtn(false);

        //Remove like to UI list
        likeView.deleteLike(currentID);

    }
   
    likeView.toogleLikeMenu(state.likes.getNumLikes());
};

//Restore likes recipes on page loads
window.addEventListener('load', () => {
    state.likes = new Like();

    //Restore likes
    state.likes.readStorage();
    
    //Toggle like menu button
    likeView.toogleLikeMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likeView.renderLike(like));
});


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
        // Add ingredient to shopping list
       controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }

});

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
   
    // Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){

        //Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);
    // Handle the count update
    } else if(e.target.matches('.shopping__count_value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});