import { FaGithub, FaLinkedin } from "react-icons/fa";
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-900">
      <p><b>Chilkaraju Pavan Kumar</b></p>
      <div className="flex justify-center gap-4 mt-1">
        <a
          href="https://github.com/pavan-git21"
          target="_blank"
          rel="noreferrer"
          className="hover:text-gray-800"
        >
          <FaGithub className="inline mr-2" />
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/pavan-chilkaraju/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-gray-800"
        >
          <FaLinkedin className="inline mr-2" />
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
