import React, { forwardRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Actions from "redux/actions";

import TextInput from "components/forms/textInput";

import SearchIcon from "/public/assets/icons/search-blue.svg";
import FilterIcon from "/public/assets/icons/branch-map-filters.svg";
import FilterIconActive from "/public/assets/icons/branch-map-filters-active.svg";

import styles from "./Filter.module.scss";
import FilterByList from "components/FilterByList/FilterByList";
import useTranslate from "hooks/useTranslate";
function FilterRef(props, ref) {
	const {
		showFilterBtn = false,
		onFilterPress,
		isOnBranchesScreen,
		showTagsOnStart = true,
		selectedTags = [],
		onEnter = () => {},
	} = props;

	const dispatch = useDispatch();
	const filters = useSelector((store) => store.filterBranches);
	const [isFilterShowing, setIsFilterShowing] = useState(showTagsOnStart);
	const allBranches = useSelector((store) => store.branches);
	const [filterTagsWithNames, setFilterTags] = useState([]);
	const [tags, setTags] = useState(null);
	const translate = useTranslate();

	useEffect(() => {
		const branchTags = new Set();

		if (allBranches) {
			for (const key in allBranches) {
				const branch = allBranches[key];

				if (branch.tags) {
					for (const tag of branch.tags) {
						branchTags.add(tag);
					}
				}
			}
		}

		setTags(branchTags);
	}, [allBranches]);

	useEffect(() => {
		if (selectedTags) {
			updateFields(selectedTags);
		}
	}, []);

	useEffect(() => {
		return () => {
			dispatch(Actions.resetFilterBranches());
		};
	}, []);

	useEffect(() => {
		const filters = [];

		if (tags) {
			let filter = {
				id: "Open",
				text: translate("devliverypopup_filterdata_opennow"),
			};

			filters.push(filter);
			for (const tag of tags) {
				filter = {
					id: tag,
					text: translate(`storeTag.${tag}`),
				};
				filters.push(filter);
			}
			setFilterTags(filters);
		}
	}, [tags]);

	function updateFilters(name, value) {
		dispatch(Actions.updateFilterBranches({ [name]: value }));
	}

	const onFilterBtnPress = () => {
		setIsFilterShowing((prev) => !prev);
		typeof onFilterPress === "function" && onFilterPress(!isFilterShowing);
	};

	function updateFields(list) {
		updateFilters("fields", list);
	}

	function updateQuery(query) {
		updateFilters("query", query);
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") {
			typeof onEnter === "function" && onEnter();
		}
	}

	const hasActiveFields =
		Array.isArray(filters.fields) && filters.fields.length > 0;

	return (
		<div
			className={`${styles["branches-filter-wrapper"]} ${
				isOnBranchesScreen ? styles["on-branches-screen"] : ""
			}
      branches-filter-wrapper
      `}>
			<div className={styles["search-input-wrapper"]}>
				<div className={styles["search-icon-wrapper"]}>
					<img
						src={SearchIcon.src}
						alt={translate("accessibility_alt_search")}
						className={styles["search-icon"]}
					/>
				</div>
				<TextInput
					className={styles["search-input"]}
					onChange={(e) => updateQuery(e.target.value)}
					type="text"
					value={filters.query}
					placeholder={translate(
						"deliveryPopup_chooseBranchFilter_placeholderLabel",
					)}
					showClearIcon
					ref={ref}
					clearClassName={showFilterBtn ? styles["fix-clear-icon"] : ""}
					ariaAutoComplete={"list"}
					name={"search"}
					id={"search"}
					onKeyDown={handleKeyDown}
				/>
				{showFilterBtn && (
					<button
						aria-label={translate("accessibility_alt_branch_filter")}
						className={styles["branch-filter-icon-wrapper"]}
						onClick={onFilterBtnPress}>
						<img
							src={hasActiveFields ? FilterIconActive.src : FilterIcon.src}
							alt={""}
							className={styles["branch-filter-icon"]}
						/>
					</button>
				)}
			</div>
			{isFilterShowing && (
				<div className={styles["branch-filter-list-wrapper"]}>
					<FilterByList
						data={filterTagsWithNames}
						onChange={updateFields}
						selectedList={filters.fields}
					/>
				</div>
			)}
		</div>
	);
}

const Filter = forwardRef(FilterRef);

export default Filter;
