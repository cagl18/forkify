import axios from 'axios';

export default class Search {
    constructor(query){
        this.query = query;
    }
    async getResults() {
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        // const key = '0730ed3b5505a2da9311d2774b93e44a'; //Key1 -- 50 requests daily
        const key = 'dffbb393bf843de113787d9c59502f4b'; //Key2 -- 50 requests daily
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            console.log(res);
            this.result = res.data.recipes;
            // console.log(this.result);
        } catch(error) {
            alert(error);
        }
    }
}

