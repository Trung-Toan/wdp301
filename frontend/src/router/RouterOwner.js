import { memo } from "react";
import { Route, Routes } from "react-router-dom";
import HomeMangement from "../components/home/HomeMangement";
import IndexManagement from "../components/index/IndexManagement";

const RouterOwner = () => {
   
  return (
    <Routes>
      <Route path="/" element={<HomeMangement />}>
        <Route index element={<IndexManagement />} />
      </Route>
    </Routes>
  );
};

export default memo(RouterOwner);