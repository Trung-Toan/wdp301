import { memo } from "react";
import { Route, Routes } from "react-router-dom";

// import IndexManagement from "../components/Page/IndexManagement";
import HomeMangement from "../layouts/HomeMangement";

const RouterOwner = () => {
   
  return (
    <Routes>
      <Route path="/" element={<HomeMangement />}>
        {/* <Route index element={<IndexManagement />} /> */}
      </Route>
    </Routes>
  );
};

export default memo(RouterOwner);