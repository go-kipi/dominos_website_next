import { stateReducers }  from "redux/slices/state";
import { dataReducers }   from "redux/slices/data";
import { formReducers }   from "redux/slices/forms";

let Reducers = {};
for(let reducer in stateReducers) {
    Reducers[reducer] = stateReducers[reducer];
}
for(let reducer in dataReducers) {
    Reducers[reducer] = dataReducers[reducer];
}
for(let reducer in formReducers) {
    Reducers[reducer] = formReducers[reducer];
}
export default Reducers;
