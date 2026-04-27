<?php
/**
 * Plugin Name: Sokogate Calculator Integration
 * Description: Integrates the Sokogate Construction Calculator into WordPress pages
 * Version: 1.0.0
 * Author: Sokogate
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Shortcode to embed the calculator
function sokogate_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'width' => '100%',
        'height' => '800px',
        'scrolling' => 'auto',
        'frameborder' => '0'
    ), $atts, 'sokogate_calculator');

    // Get the calculator URL - adjust this to match your deployment
    $calculator_url = home_url('/Calculate/');

    ob_start();
    ?>
    <div class="sokogate-calculator-wrapper" style="width: 100%; margin: 20px 0;">
        <iframe
            src="<?php echo esc_url($calculator_url); ?>"
            width="<?php echo esc_attr($atts['width']); ?>"
            height="<?php echo esc_attr($atts['height']); ?>"
            scrolling="<?php echo esc_attr($atts['scrolling']); ?>"
            frameborder="<?php echo esc_attr($atts['frameborder']); ?>"
            style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
            title="Sokogate Construction Materials Calculator"
        >
            <p>Your browser does not support iframes. <a href="<?php echo esc_url($calculator_url); ?>" target="_blank">Click here to access the calculator</a></p>
        </iframe>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('sokogate_calculator', 'sokogate_calculator_shortcode');

// Alternative: Direct proxy method (requires allow_url_fopen or cURL)
function sokogate_calculator_proxy_shortcode($atts) {
    $atts = shortcode_atts(array(
        'path' => ''
    ), $atts, 'sokogate_calculator_proxy');

    // Get the calculator base URL
    $calculator_base = 'http://127.0.0.1:3000'; // Adjust to your Node.js app URL

    // Build the full URL
    $calculator_url = $calculator_base . '/Calculate/' . ltrim($atts['path'], '/');

    // Fetch content from Node.js app
    $response = wp_remote_get($calculator_url);

    if (is_wp_error($response)) {
        return '<p>Error loading calculator: ' . $response->get_error_message() . '</p>';
    }

    $body = wp_remote_retrieve_body($response);
    $content_type = wp_remote_retrieve_header($response, 'content-type');

    // Return the content with appropriate headers
    if (strpos($content_type, 'text/html') !== false) {
        // For HTML, we need to post-process URLs
        $body = str_replace('/Calculate/', home_url('/Calculate/'), $body);
        return $body;
    }

    return $body;
}
// Uncomment to enable proxy method instead of iframe:
// add_shortcode('sokogate_calculator_proxy', 'sokogate_calculator_proxy_shortcode');

// Enqueue any necessary styles
function sokogate_calculator_styles() {
    wp_enqueue_style(
        'sokogate-calculator',
        plugin_dir_url(__FILE__) . 'css/sokogate-calculator.css',
        array(),
        '1.0.0'
    );
}
// Uncomment if you add custom CSS:
// add_action('wp_enqueue_scripts', 'sokogate_calculator_styles');
?>