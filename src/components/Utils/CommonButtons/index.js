// import React from "react";
// import "../../ComponentsCss/utils/CommonButtons/CommonButtons.css";

// export default function CommonButtons() {
//   return (
//     <div>
//       {/* <h2>buttons</h2>
//       <secondaryButton /> */}
     

//       {/* <primaryButton/> */}
//       {/* <secondaryButton/> */}
//       {/* <applyButton/> */}
//       {/* <iconButton/> */}

// {/*  applyButton
// import React from 'react';
// import "../../ComponentsCss/utils/CommonButtons/CommonButtons.css";

// export default function applyButton(){
//     return(
//         <div>
//             <div>
//             <button className="apply-button one">apply Button</button>
//             </div>
//         </div>
//     )
// }
// */}

// {/*  iconButton
// import React from 'react';
// import "../../ComponentsCss/utils/CommonButtons/CommonButtons.css";

// export default function iconButton(){
//     return(
//         <div>
//             <div>
//             <button className="icon-text-button one">
//             <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
//           </svg>
//           <span>View</span>
//         </button>

//         <button className="icon-text-button">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
//           </svg>
//           <span>Edit</span>
//         </button>
        
//             </div>
//         </div>
//     )
// }
// */}
//       {/* <div>
//         <button className="primary-button one">Primary Button</button>
//         <button className="secondary-button one">Secondary Button</button>
//         <button className="apply-button one">Apply Button</button>
//         <button className="icon-text-button one">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
//           </svg>
//           <span>View</span>
//         </button>

//         <button className="icon-text-button">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
//           </svg>
//           <span>Edit</span>
//         </button>
//       </div>
//        <div className="secondcolor "> 
//       <button className="primary-button two">Primary Button</button>
//         <button className="secondary-button two">Secondary Button</button>
//         <button className="apply-button one">Apply Button</button>
//         <button className="icon-text-button one">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
//           </svg>
//           <span>View</span>
//         </button>

//         <button className="icon-text-button">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
//           </svg>
//           <span>Edit</span>
//         </button>

//       </div>

//       <div className="thirdcolor">
//       <button className="primary-button two">Primary Button</button>
//         <button className="secondary-button two">Secondary Button</button>
//         <button className="apply-button one">Apply Button</button>
//         <button className="icon-text-button one">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
//           </svg>
//           <span>View</span>
//         </button>

//         <button className="icon-text-button">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />

//           </svg>
//           <span>Edit</span>
//         </button>
//       </div>
//       <div className="fourthcolor">
//       <button className="primary-button two">Primary Button</button>
//         <button className="secondary-button two">Secondary Button</button>
//         <button className="apply-button one">Apply Button</button>
//         <button className="icon-text-button one">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
//           </svg>
//           <span>View</span>
//         </button>

//         <button className="icon-text-button">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             width="24"
//             height="24"
//           >
//             <path fill="none" d="M0 0h24v24H0z" />
//             <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
//           </svg>
//           <span>Edit</span>
//         </button>
//       </div> */}
//     </div>
//   );
// }
