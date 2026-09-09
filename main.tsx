import {createRoot} from 'react-dom/client';
import './styles/fonts.css';
import './styles/base.css';
import WarrantyScannerApp from './components/warranty-scanner-app';

createRoot(document.getElementById('root')!).render(<WarrantyScannerApp />);
