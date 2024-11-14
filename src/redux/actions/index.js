import { stateActions } from "redux/slices/state";
import { formActions }  from "redux/slices/forms";
import { dataActions }  from "redux/slices/data";

const Actions = {...stateActions, ...formActions, ...dataActions};
export default Actions;