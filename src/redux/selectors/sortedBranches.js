import {createSelector} from "reselect";
import {calcDistance} from "utils/functions";

const branches = (state) => state?.branches;
const currentLocation = (state) => state?.currentLocation;

export const sortedBranches = createSelector(
    branches,
    currentLocation,
    (branches, currentLocation) => {
        if (!currentLocation) {
            return branches;
        }
        if (!branches) {
            return branches;
        }
        const allBranches = JSON.parse(JSON.stringify(branches));

        allBranches.sort(function (a, b) {
            const branchALocation = {lat: a.lat, lng: a.lng};
            const branchBLocation = {lat: b.lat, lng: b.lng};

            const distanceA = calcDistance(branchALocation, currentLocation, 'float');
            const distanceB = calcDistance(branchBLocation, currentLocation, 'float');

            a.distance = distanceA.toFixed(1);
            b.distance = distanceB.toFixed(1);

            if (distanceA > distanceB) {
                return 1;
            }
            if (distanceA < distanceB) {
                return -1;
            }
            return 0;
        });
        return allBranches;
    }
);
